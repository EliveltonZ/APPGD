'use strict';
const { Materiais } = require('../client/db');
const { Op } = require('sequelize');

async function listar(apenasAtivos = false) {
  const where = apenasAtivos ? { ativo: true } : {};
  return Materiais.findAll({
    where,
    order: [['descricao', 'ASC']],
    raw: true,
  });
}

async function buscarPorId(id) {
  return Materiais.findByPk(id, { raw: true });
}

// Versão leve pra seletor/combobox — sem preço nem dados sensíveis, só o
// necessário pra identificar o material. Não exige a permissão de cadastro,
// já que escolher um material (ex.: casar referência do XML) é diferente de
// administrar o catálogo.
async function listarOpcoes() {
  return Materiais.findAll({
    where: { ativo: true },
    attributes: ['id', 'codigoInterno', 'descricao', 'unidadeBase'],
    order: [['descricao', 'ASC']],
    raw: true,
  });
}

async function criar(body) {
  const isM2 = body.unidade_base === 'M2';
  return Materiais.create({
    codigoInterno:   body.codigo_interno,
    descricao:       body.descricao,
    unidadeBase:     body.unidade_base,
    espessura:       body.espessura       ?? null,
    m2PorUnidade:   isM2 ? (body.m2_por_unidade ?? 5.0416) : null,
    // estoque_minimo_un vale pra qualquer unidade_base (chapa ou ferragem) —
    // é o que decide se o material participa do controle de reserva.
    estoqueMinimoUn: body.estoque_minimo_un ?? null,
    ativo:           body.ativo ?? true,
  });
}

async function atualizar(id, body) {
  const isM2 = body.unidade_base === 'M2';
  const [n] = await Materiais.update({
    codigoInterno:   body.codigo_interno,
    descricao:       body.descricao,
    unidadeBase:     body.unidade_base,
    espessura:       body.espessura       ?? null,
    m2PorUnidade:   isM2 ? (body.m2_por_unidade ?? null) : null,
    estoqueMinimoUn: body.estoque_minimo_un ?? null,
    ativo:           body.ativo ?? true,
  }, { where: { id } });
  return n > 0;
}

async function excluir(id) {
  const n = await Materiais.destroy({ where: { id } });
  return n > 0;
}

module.exports = { listar, buscarPorId, listarOpcoes, criar, atualizar, excluir };
