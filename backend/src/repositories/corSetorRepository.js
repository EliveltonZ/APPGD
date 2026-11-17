const { CorSetor } = require('../client/db');

async function listarCores() {
  const rows = await CorSetor.findAll();
  const mapa = {};
  for (const row of rows) mapa[row.setor] = row.cor;
  return mapa;
}

async function salvarCor(setor, cor) {
  const chave = String(setor).trim();
  await CorSetor.upsert({ setor: chave, cor, atualizadoEm: new Date() });
  return { setor: chave, cor };
}

module.exports = { listarCores, salvarCor };
