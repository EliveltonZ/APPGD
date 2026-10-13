'use strict';
const { parseNFeXml } = require('./nfeXmlParser');
const fornecedoresRepo = require('../repositories/fornecedoresRepository');
const codigoNFRepo = require('../repositories/materiaisCodigoNFRepository');
const notaFiscalRepo = require('../repositories/notaFiscalRepository');
const { Materiais } = require('../client/db');

// Lê o XML + tenta casar fornecedor (por CNPJ) e cada item (por vínculo
// código-interno↔fornecedor já salvo, via tblMateriaisCodigoNF). Nada é
// gravado aqui — só prévia, igual ao padrão já usado no XML do Promob
// (prévia sem gravar, confirmação grava).
async function preview(xmlText) {
  const parsed = parseNFeXml(xmlText);

  const fornecedor = await fornecedoresRepo.buscarPorCnpj(parsed.fornecedor.cnpj);

  // Avisa já na prévia se essa nota já foi lançada — evita o usuário
  // preencher/casar tudo de novo só pra descobrir isso na hora de salvar.
  const duplicata = await notaFiscalRepo.buscarDuplicata({
    chave: parsed.chave,
    fornecedorId: fornecedor?.id ?? null,
    numeroNota: parsed.numeroNota,
  });

  const itens = await Promise.all(
    parsed.itens.map(async (item) => {
      if (!fornecedor || !item.codigoNf) {
        return { ...item, materialId: null, codigoInterno: null, materialDescricao: null, fator: null };
      }
      const vinculo = await codigoNFRepo.buscarPorCodigoFornecedor(fornecedor.id, item.codigoNf);
      if (!vinculo) {
        return { ...item, materialId: null, codigoInterno: null, materialDescricao: null, fator: null };
      }
      const material = await Materiais.findByPk(vinculo.materialId, { raw: true });
      if (!material) {
        return { ...item, materialId: null, codigoInterno: null, materialDescricao: null, fator: null };
      }
      return {
        ...item,
        materialId: material.id,
        codigoInterno: material.codigoInterno,
        materialDescricao: material.descricao,
        fator: vinculo.m2PorUnidade != null ? Number(vinculo.m2PorUnidade) : null,
      };
    }),
  );

  return {
    chave: parsed.chave,
    numeroNota: parsed.numeroNota,
    dataEmissao: parsed.dataEmissao,
    dataEntrada: parsed.dataEntrada,
    valorTotal: parsed.valorTotal,
    jaLancada: !!duplicata,
    fornecedor: {
      id: fornecedor?.id ?? null,
      cnpj: parsed.fornecedor.cnpj,
      nome: parsed.fornecedor.nome,
      inscricaoEstadual: parsed.fornecedor.inscricaoEstadual,
      endereco: parsed.fornecedor.endereco,
      numero: parsed.fornecedor.numero,
      bairro: parsed.fornecedor.bairro,
      cidade: parsed.fornecedor.cidade,
      cep: parsed.fornecedor.cep,
      estado: parsed.fornecedor.estado,
    },
    itens,
  };
}

module.exports = { preview };
