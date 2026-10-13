'use strict';
const { MateriaisCodigoNF } = require('../client/db');

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

// Cria ou atualiza o vínculo (material, fornecedor, código NF) — mesma
// chave única do banco. Chamado ao lançar NF quando o usuário marca
// "salvar vínculo pra próxima vez".
async function upsertVinculo({ materialId, fornecedorId, codigoNf, unidadeCompra, m2PorUnidade }, options = {}) {
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
  }, { transaction: options.transaction });
}

module.exports = { buscarVinculo, listarPorMaterial, upsertVinculo };
