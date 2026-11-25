'use strict';

const crypto = require('crypto');

// Quem ja tinha cracha_hash (hash hex de 32 caracteres, formato antigo) ja
// ficou com o cracha invalido desde a migracao do codigo numerico de 10
// digitos -- em vez de cada um ter que ir em Cadastro de Usuarios gerar de
// novo manualmente, regera aqui pra todos de uma vez. O cracha fisico de
// quem ja tinha precisa ser reimpresso mesmo assim (o codigo mudou).
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
        codigo = String(crypto.randomInt(0, 10 ** 10)).padStart(10, '0');
      } while (usados.has(codigo));
      usados.add(codigo);

      await queryInterface.sequelize.query(
        `UPDATE "tblUsuario" SET cracha_hash = :codigo WHERE id = :id;`,
        { replacements: { codigo, id } },
      );
    }
  },

  // Irreversivel -- nao guardamos os hashes antigos (ja estavam todos
  // invalidos mesmo, fase de teste, nenhum cracha fisico com o formato novo
  // tinha sido impresso ainda).
  async down() {},
};
