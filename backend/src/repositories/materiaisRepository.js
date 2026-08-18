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

async function criar(body) {
  const isM2 = body.unidade_base === 'M2';
  return Materiais.create({
    codigoInterno:   body.codigo_interno,
    descricao:       body.descricao,
    unidadeBase:     body.unidade_base,
    espessura:       body.espessura       ?? null,
    m2PorUnidade:   isM2 ? (body.m2_por_unidade ?? 5.0416) : null,
    estoqueMinimoUn: isM2 ? (body.estoque_minimo_un ?? null) : null,
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
    estoqueMinimoUn: isM2 ? (body.estoque_minimo_un ?? null) : null,
    ativo:           body.ativo ?? true,
  }, { where: { id } });
  return n > 0;
}

async function excluir(id) {
  const n = await Materiais.destroy({ where: { id } });
  return n > 0;
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
