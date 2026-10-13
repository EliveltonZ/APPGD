'use strict';
const { Fornecedores, sequelize } = require('../client/db');

async function listar() {
  return Fornecedores.findAll({ order: [['nome', 'ASC']], raw: true });
}

// Busca por CNPJ ignorando pontuação — o cadastro guarda formatado
// ("61.069.373/0061-44") mas a leitura de XML de NF-e só tem dígitos.
async function buscarPorCnpj(cnpjDigitos) {
  if (!cnpjDigitos) return null;
  const rows = await sequelize.query(
    `SELECT * FROM "tblFornecedores"
     WHERE regexp_replace(cnpj, '\\D', '', 'g') = :cnpj
     LIMIT 1`,
    { replacements: { cnpj: cnpjDigitos }, type: sequelize.QueryTypes.SELECT },
  );
  return rows[0] ?? null;
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

module.exports = { listar, criar, atualizar, excluir, buscarPorCnpj };
