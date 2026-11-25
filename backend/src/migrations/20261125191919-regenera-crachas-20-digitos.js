'use strict';

const crypto = require('crypto');

function gerarCodigoNumerico(digitos) {
  let codigo = '';
  while (codigo.length < digitos) {
    codigo += String(crypto.randomInt(0, 10 ** 10)).padStart(10, '0');
  }
  return codigo.slice(0, digitos);
}

// 10 dígitos ficou visualmente curto demais pro tamanho do crachá -- regera
// de novo os mesmos usuários que já tinham cracha_hash, agora com 20
// dígitos (mesmo motivo da migration anterior: evita refazer um a um em
// Cadastro de Usuários). Precisam ser reimpressos de novo.
module.exports = {
  async up(queryInterface) {
    const rows = await queryInterface.sequelize.query(
      `SELECT id FROM "tblUsuario" WHERE cracha_hash IS NOT NULL`,
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );

    const usados = new Set();
    for (const { id } of rows) {
      let codigo;
      do {
        codigo = gerarCodigoNumerico(20);
      } while (usados.has(codigo));
      usados.add(codigo);

      await queryInterface.sequelize.query(
        `UPDATE "tblUsuario" SET cracha_hash = :codigo WHERE id = :id;`,
        { replacements: { codigo, id } },
      );
    }
  },

  // Irreversivel, mesmo motivo das migrations anteriores de cracha.
  async down() {},
};
