'use strict';
const { Fornecedores } = require('../client/db');

async function listar() {
  return Fornecedores.findAll({ order: [['nome', 'ASC']], raw: true });
}

function camposEndereco(body) {
  return {
    nome:              body.nome.trim(),
    cnpj:              body.cnpj?.trim() || null,
    contato:           body.contato?.trim() || null,
    ativo:             body.ativo ?? true,
    inscricaoEstadual: body.inscricao_estadual?.trim() || null,
    endereco:          body.endereco?.trim() || null,
    numero:            body.numero?.trim() || null,
    bairro:            body.bairro?.trim() || null,
    cidade:            body.cidade?.trim() || null,
    cep:               body.cep?.trim() || null,
    estado:            body.estado?.trim().toUpperCase() || null,
  };
}

async function criar(body) {
  return Fornecedores.create(camposEndereco(body));
}

async function atualizar(id, body) {
  const [n] = await Fornecedores.update(camposEndereco(body), { where: { id } });
  return n > 0;
}

async function excluir(id) {
  const n = await Fornecedores.destroy({ where: { id } });
  return n > 0;
}

module.exports = { listar, criar, atualizar, excluir };
