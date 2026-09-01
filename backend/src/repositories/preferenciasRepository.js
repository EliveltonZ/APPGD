const { QueryTypes } = require('sequelize');
const { sequelize } = require('../client/db');

async function buscarPreferencias(userId, chaves) {
  return sequelize.query(
    `SELECT chave, valor
       FROM "tblPreferencias"
      WHERE id_usuario = :userId
        AND chave IN (:chaves)`,
    { replacements: { userId, chaves }, type: QueryTypes.SELECT },
  );
}

async function salvarPreferencias(userId, entries) {
  await Promise.all(
    entries.map(([chave, valor]) =>
      sequelize.query(
        `INSERT INTO "tblPreferencias" (id_usuario, chave, valor)
         VALUES (:userId, :chave, :valor)
         ON CONFLICT (id_usuario, chave)
         DO UPDATE SET valor = EXCLUDED.valor, atualizado = now()`,
        { replacements: { userId, chave, valor: String(valor) } },
      )
    )
  );
}

module.exports = { buscarPreferencias, salvarPreferencias };
