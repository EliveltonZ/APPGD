'use strict';
const { sequelize, MateriaisCodigoNF } = require('../client/db');

// Vínculo mais recente entre material+fornecedor — usado pra auto-preencher
// código NF/unidade de compra/fator ao lançar uma nova nota fiscal. Pode
// existir mais de um código NF salvo pro mesmo par (fornecedor mudou o
// código ao longo do tempo); o mais recente é o palpite razoável.
async function buscarVinculo(materialId, fornecedorId) {
  return MateriaisCodigoNF.findOne({
    where: { materialId, fornecedorId },
    order: [['id', 'DESC']],
    raw: true,
  });
}

async function listarPorMaterial(materialId) {
  return MateriaisCodigoNF.findAll({ where: { materialId }, raw: true });
}

// Direção inversa de buscarVinculo — usada na leitura de XML de NF-e, onde
// se conhece o fornecedor e o código dele (cProd), e se quer descobrir qual
// material do cadastro corresponde.
async function buscarPorCodigoFornecedor(fornecedorId, codigoNf) {
  return MateriaisCodigoNF.findOne({
    where: { fornecedorId, codigoNf },
    order: [['id', 'DESC']],
    raw: true,
  });
}

// Cria ou atualiza o vínculo (material, fornecedor, código NF) — mesma
// chave única do banco. Chamado ao lançar NF quando o usuário marca
// "salvar vínculo pra próxima vez".
// "criado por/em" só é gravado na criação — um upsert que caiu no update
// (vínculo já existia) não deve apagar a autoria original.
async function upsertVinculo({ materialId, fornecedorId, codigoNf, unidadeCompra, m2PorUnidade, usuarioId }, options = {}) {
  const existente = await MateriaisCodigoNF.findOne({
    where: { materialId, fornecedorId, codigoNf },
    transaction: options.transaction,
  });
  if (existente) {
    existente.unidadeCompra = unidadeCompra;
    existente.m2PorUnidade = m2PorUnidade ?? null;
    await existente.save({ transaction: options.transaction });
    return existente;
  }
  return MateriaisCodigoNF.create({
    materialId, fornecedorId, codigoNf, unidadeCompra,
    m2PorUnidade: m2PorUnidade ?? null,
    criadoPorId: usuarioId ?? null,
  }, { transaction: options.transaction });
}

// Lista completa de vínculos pra consulta/correção — o time de almoxarifado
// pode vincular um item errado durante o lançamento de uma nota (material
// errado, ou fator errado pra fita), e precisa achar e corrigir depois sem
// ter que lançar uma nota nova só pra sobrescrever.
async function listarTodos() {
  return sequelize.query(
    `SELECT v.id, v.material_id, v.fornecedor_id, v.codigo_nf, v.unidade_compra, v.m2_por_unidade,
            v.criado_em, u.login AS criado_por,
            m.codigo_interno, m.descricao AS material_descricao, m.unidade_base,
            f.nome AS fornecedor_nome
     FROM "tblMateriaisCodigoNF" v
     JOIN "tblMateriais" m         ON m.id = v.material_id
     JOIN "tblFornecedores" f      ON f.id = v.fornecedor_id
     LEFT JOIN "tblUsuario" u      ON u.id = v.criado_por_id
     ORDER BY f.nome ASC, m.codigo_interno ASC`,
    { type: sequelize.QueryTypes.SELECT },
  );
}

// Corrige um vínculo já salvo — permite trocar pra qual material ele aponta
// (vínculo errado) e/ou o fator (m²-por-unidade — significa metros por
// rolo pra fita, m² por chapa pra chapa). Nunca troca fornecedor/código NF:
// isso mudaria a própria identidade do vínculo (a chave única da tabela) —
// pra isso o jeito correto é excluir este e criar um novo.
async function atualizarVinculo(id, { materialId, unidadeCompra, m2PorUnidade }) {
  const vinculo = await MateriaisCodigoNF.findByPk(id);
  if (!vinculo) return null;
  if (materialId != null) vinculo.materialId = materialId;
  if (unidadeCompra != null) vinculo.unidadeCompra = unidadeCompra;
  vinculo.m2PorUnidade = m2PorUnidade ?? null;
  await vinculo.save();
  return vinculo;
}

async function excluirVinculo(id) {
  const n = await MateriaisCodigoNF.destroy({ where: { id } });
  return n > 0;
}

module.exports = {
  buscarVinculo,
  listarPorMaterial,
  upsertVinculo,
  buscarPorCodigoFornecedor,
  listarTodos,
  atualizarVinculo,
  excluirVinculo,
};
