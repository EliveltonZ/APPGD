'use strict';
const { sequelize, NotasFiscais, NotasFiscaisItens, EstoqueMovimentos, Materiais } = require('../client/db');
const codigoNFRepo = require('./materiaisCodigoNFRepository');
const localizacoesRepo = require('./localizacoesRepository');

async function listar() {
  const [rows] = await sequelize.query(
    `SELECT
       nf.id, nf.numero_nota, nf.data_emissao, nf.data_entrada, nf.valor_total, nf.observacoes,
       f.nome AS fornecedor_nome,
       u.login AS usuario_login,
       COUNT(nfi.id) AS total_itens
     FROM "tblNotasFiscais" nf
     JOIN "tblFornecedores" f ON f.id = nf.fornecedor_id
     JOIN "tblUsuario"      u ON u.id = nf.usuario_id
     LEFT JOIN "tblNotasFiscaisItens" nfi ON nfi.nota_fiscal_id = nf.id
     GROUP BY nf.id, f.nome, u.login
     ORDER BY nf.data_entrada DESC, nf.id DESC
     LIMIT 200`,
  );
  return rows;
}

async function buscarItens(notaFiscalId) {
  const [rows] = await sequelize.query(
    `SELECT nfi.*, m.codigo_interno, m.descricao AS material_descricao
     FROM "tblNotasFiscaisItens" nfi
     JOIN "tblMateriais" m ON m.id = nfi.material_id
     WHERE nfi.nota_fiscal_id = :id
     ORDER BY nfi.id ASC`,
    { replacements: { id: Number(notaFiscalId) } },
  );
  return rows;
}

function validarItem(item) {
  if (!item.materialId) throw new Error('Selecione o material.');
  const qtdNf = Number(item.qtdNf);
  const qtdUn = Number(item.qtdUn);
  if (!Number.isFinite(qtdNf) || qtdNf <= 0) throw new Error('Quantidade (NF) inválida.');
  if (!Number.isFinite(qtdUn) || qtdUn <= 0) throw new Error('Quantidade (UN) inválida.');
  if (!item.unidadeCompra?.trim()) throw new Error('Informe a unidade de compra.');
  const precoNf = item.precoNf != null ? Number(item.precoNf) : null;
  const precoUn = item.precoUn != null ? Number(item.precoUn) : null;
  if (precoNf != null && !Number.isFinite(precoNf)) throw new Error('Preço (NF) inválido.');
  if (precoUn != null && !Number.isFinite(precoUn)) throw new Error('Preço (UN) inválido.');
  return { qtdNf, qtdUn, precoNf, precoUn };
}

// Lança uma nota fiscal completa: cabeçalho + itens + entrada de estoque por
// item (tblEstoqueMovimentos, tipo ENTRADA) + atualização do último preço do
// material + vínculo código-interno↔fornecedor (quando marcado). Tudo numa
// transação só — ou lança tudo, ou nada.
//
// A localização de entrada nunca é escolhida na hora de lançar a nota — toda
// NF entra direto na localização marcada como "padrão de recebimento"
// (Cadastros > Localizações). Os responsáveis transferem pra localização
// definitiva depois, via Transferências.
async function criar(body, usuarioId) {
  if (!body.fornecedorId) throw new Error('Selecione o fornecedor.');
  if (!body.numeroNota?.trim()) throw new Error('Informe o número da nota.');
  if (!body.dataEntrada) throw new Error('Informe a data de entrada.');
  if (!Array.isArray(body.itens) || body.itens.length === 0) {
    throw new Error('Adicione ao menos um item.');
  }

  const recebimento = await localizacoesRepo.buscarRecebimento();
  if (!recebimento) {
    throw new Error('Nenhuma localização de recebimento configurada — marque uma em Cadastros > Localizações.');
  }

  const fornecedorId = Number(body.fornecedorId);
  const localizacaoId = recebimento.id;
  const dataEntrada = body.dataEntrada;

  return sequelize.transaction(async (t) => {
    let valorTotal = 0;
    const itensValidados = body.itens.map((item) => ({ item, ...validarItem(item) }));
    for (const { precoNf, qtdNf } of itensValidados) {
      if (precoNf != null) valorTotal += precoNf * qtdNf;
    }

    const nf = await NotasFiscais.create({
      numeroNota:   body.numeroNota.trim(),
      fornecedorId,
      dataEmissao:  body.dataEmissao || null,
      dataEntrada,
      valorTotal:   valorTotal > 0 ? Math.round(valorTotal * 100) / 100 : null,
      usuarioId:    Number(usuarioId),
      observacoes:  body.observacoes || null,
    }, { transaction: t });

    for (const { item, qtdNf, qtdUn, precoNf, precoUn } of itensValidados) {
      const materialId = Number(item.materialId);
      const total = precoNf != null ? Math.round(precoNf * qtdNf * 100) / 100 : null;

      const nfItem = await NotasFiscaisItens.create({
        notaFiscalId:  nf.id,
        codigoNf:      item.codigoNf?.trim() || null,
        materialId,
        descricaoNf:   item.descricaoNf?.trim() || null,
        unidadeCompra: item.unidadeCompra.trim().toUpperCase(),
        qtdNf,
        qtdUn,
        precoNf,
        precoUn,
        total,
      }, { transaction: t });

      await EstoqueMovimentos.create({
        materialId,
        localizacaoId,
        tipo:         'ENTRADA',
        qtdUn,
        precoUn,
        fornecedorId,
        nfItemId:     nfItem.id,
        data:         dataEntrada,
        usuarioId:    Number(usuarioId),
        observacoes:  null,
      }, { transaction: t });

      if (precoUn != null) {
        const material = await Materiais.findByPk(materialId, { transaction: t });
        const dataAtual = material.dataUltimoPreco;
        if (!dataAtual || new Date(dataEntrada) >= new Date(dataAtual)) {
          material.ultimoPrecoUn = precoUn;
          material.dataUltimoPreco = dataEntrada;
          await material.save({ transaction: t });
        }
      }

      if (item.salvarVinculo && item.codigoNf?.trim()) {
        await codigoNFRepo.upsertVinculo({
          materialId,
          fornecedorId,
          codigoNf:      item.codigoNf.trim(),
          unidadeCompra: item.unidadeCompra.trim().toUpperCase(),
          m2PorUnidade:  item.fator != null ? Number(item.fator) : null,
        }, { transaction: t });
      }
    }

    return { id: nf.id };
  });
}

module.exports = { listar, buscarItens, criar };
