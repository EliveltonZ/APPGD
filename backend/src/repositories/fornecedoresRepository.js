'use strict';
const { Fornecedores } = require('../client/db');

async function listar() {
  return Fornecedores.findAll({ order: [['nome', 'ASC']], raw: true });
}

async function criar(body) {
  return Fornecedores.create({
    nome:    body.nome.trim(),
    cnpj:    body.cnpj?.trim() || null,
    contato: body.contato?.trim() || null,
    ativo:   body.ativo ?? true,
  });
}

async function atualizar(id, body) {
  const [n] = await Fornecedores.update({
    nome:    body.nome.trim(),
    cnpj:    body.cnpj?.trim() || null,
    contato: body.contato?.trim() || null,
    ativo:   body.ativo ?? true,
  }, { where: { id } });
  return n > 0;
}

async function excluir(id) {
  const n = await Fornecedores.destroy({ where: { id } });
  return n > 0;
}

module.exports = { listar, criar, atualizar, excluir };
