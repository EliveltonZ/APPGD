'use strict';
const { Op } = require('sequelize');
const { Localizacoes, sequelize } = require('../client/db');

// "codigo" (ex.: 01-01-03-D) não é uma coluna — é só a junção de
// rua/prateleira/nivel/divisao, calculada aqui pra todo consumidor que só
// quer mostrar/selecionar o endereço como texto (Transferências, Nota
// Fiscal, Baixas) continuar funcionando sem precisar montar isso sozinho.
function comCodigo(row) {
  return { ...row, codigo: `${row.rua}-${row.prateleira}-${row.nivel}-${row.divisao}` };
}

// Só Almoxarifado — Fábrica e Expedição são posições únicas e agregadas,
// geridas automaticamente (baixa/pronto), nunca aparecem pra escolher numa
// tela (cadastro, transferência, baixa, nota fiscal).
async function listar() {
  const rows = await Localizacoes.findAll({
    where: { deposito: 'ALMOXARIFADO' },
    order: [['rua', 'ASC'], ['prateleira', 'ASC'], ['nivel', 'ASC'], ['divisao', 'ASC']],
    raw: true,
  });
  return rows.map(comCodigo);
}

// Localização padrão de recebimento — toda nota fiscal lançada entra aqui
// automaticamente (ver notaFiscalRepository.criar), e os responsáveis
// transferem pra localização definitiva depois via Transferências.
async function buscarRecebimento() {
  const row = await Localizacoes.findOne({ where: { padraoRecebimento: true }, raw: true });
  return row ? comCodigo(row) : null;
}

// Localização única e agregada de um depósito (FABRICA ou EXPEDICAO) — não
// tem prateleira de verdade, só existe uma de cada, criada pela migration.
async function buscarPorDeposito(deposito) {
  const row = await Localizacoes.findOne({ where: { deposito }, raw: true });
  return row ? comCodigo(row) : null;
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
    descricao:         body.descricao?.trim() || null,
    ativo:             body.ativo ?? true,
    padraoRecebimento: body.padrao_recebimento ?? false,
  };
}

// Só uma localização pode ser a padrão de recebimento por vez — marcar uma
// nova desmarca automaticamente a anterior (índice único parcial no banco
// garante isso de qualquer forma, mas aqui evita o usuário esbarrar num
// erro de constraint só pra trocar qual é a padrão).
async function desmarcarOutrasRecebimento(idAtual, transaction) {
  await Localizacoes.update(
    { padraoRecebimento: false },
    { where: idAtual ? { padraoRecebimento: true, id: { [Op.ne]: idAtual } } : { padraoRecebimento: true }, transaction },
  );
}

async function criar(body) {
  const campos = camposEndereco(body);
  return sequelize.transaction(async (t) => {
    if (campos.padraoRecebimento) {
      await desmarcarOutrasRecebimento(null, t);
    }
    const row = await Localizacoes.create(campos, { transaction: t });
    return comCodigo(row.toJSON());
  });
}

async function atualizar(id, body) {
  const campos = camposEndereco(body);
  return sequelize.transaction(async (t) => {
    if (campos.padraoRecebimento) {
      await desmarcarOutrasRecebimento(Number(id), t);
    }
    const [n] = await Localizacoes.update(campos, { where: { id }, transaction: t });
    return n > 0;
  });
}

async function excluir(id) {
  const n = await Localizacoes.destroy({ where: { id } });
  return n > 0;
}

module.exports = { listar, criar, atualizar, excluir, buscarRecebimento, buscarPorDeposito };
