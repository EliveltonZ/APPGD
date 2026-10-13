'use strict';
const { Localizacoes } = require('../client/db');

// "codigo" (ex.: 01-01-03-D) não é uma coluna — é só a junção de
// rua/prateleira/nivel/divisao, calculada aqui pra todo consumidor que só
// quer mostrar/selecionar o endereço como texto (Transferências, Nota
// Fiscal, Baixas) continuar funcionando sem precisar montar isso sozinho.
function comCodigo(row) {
  return { ...row, codigo: `${row.rua}-${row.prateleira}-${row.nivel}-${row.divisao}` };
}

async function listar() {
  const rows = await Localizacoes.findAll({
    order: [['rua', 'ASC'], ['prateleira', 'ASC'], ['nivel', 'ASC'], ['divisao', 'ASC']],
    raw: true,
  });
  return rows.map(comCodigo);
}

function camposEndereco(body) {
  const rua        = String(body.rua ?? '').trim().toUpperCase();
  const prateleira = String(body.prateleira ?? '').trim().toUpperCase();
  const nivel      = String(body.nivel ?? '').trim().toUpperCase();
  const divisao    = String(body.divisao ?? '').trim().toUpperCase();
  if (!rua || !prateleira || !nivel || !divisao) {
    throw Object.assign(new Error('Informe rua, prateleira, nível e divisão.'), { status: 400 });
  }
  return {
    rua, prateleira, nivel, divisao,
    descricao: body.descricao?.trim() || null,
    ativo:     body.ativo ?? true,
  };
}

async function criar(body) {
  const row = await Localizacoes.create(camposEndereco(body));
  return comCodigo(row.toJSON());
}

async function atualizar(id, body) {
  const [n] = await Localizacoes.update(camposEndereco(body), { where: { id } });
  return n > 0;
}

async function excluir(id) {
  const n = await Localizacoes.destroy({ where: { id } });
  return n > 0;
}

module.exports = { listar, criar, atualizar, excluir };
