'use strict';
const { Localizacoes } = require('../client/db');

async function listar() {
  return Localizacoes.findAll({ order: [['rua', 'ASC'], ['prateleira', 'ASC'], ['nivel', 'ASC'], ['divisao', 'ASC']], raw: true });
}

// Endereçamento estruturado (Rua-Prateleira-Nível-Divisão) — o código
// exibido/selecionado em todo o resto do app (Transferências, Nota Fiscal,
// Baixas) é sempre gerado a partir dos 4 campos, nunca digitado à mão.
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
    codigo:    `${rua}-${prateleira}-${nivel}-${divisao}`,
    descricao: body.descricao?.trim() || null,
    ativo:     body.ativo ?? true,
  };
}

async function criar(body) {
  return Localizacoes.create(camposEndereco(body));
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
