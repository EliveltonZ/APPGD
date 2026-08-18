'use strict';
const { Localizacoes } = require('../client/db');

async function listar() {
  return Localizacoes.findAll({ order: [['codigo', 'ASC']], raw: true });
}

async function criar(body) {
  return Localizacoes.create({
    codigo:    body.codigo.trim().toUpperCase(),
    descricao: body.descricao?.trim() || null,
    ativo:     body.ativo ?? true,
  });
}

async function atualizar(id, body) {
  const [n] = await Localizacoes.update({
    codigo:    body.codigo.trim().toUpperCase(),
    descricao: body.descricao?.trim() || null,
    ativo:     body.ativo ?? true,
  }, { where: { id } });
  return n > 0;
}

async function excluir(id) {
  const n = await Localizacoes.destroy({ where: { id } });
  return n > 0;
}

module.exports = { listar, criar, atualizar, excluir };
