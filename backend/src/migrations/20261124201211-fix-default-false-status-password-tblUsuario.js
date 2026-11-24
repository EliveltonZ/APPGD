'use strict';

// tblUsuario.status (logistica_status) e tblUsuario.password
// (config_senha) sao as unicas 2 colunas de permissao do sistema com
// defaultValue: true no model -- todo usuario novo nascia com essas 2
// permissoes jah ligadas, mesmo sem ninguem conceder. Corrige o default pra
// false, igual a toda outra permissao do sistema.
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "tblUsuario" ALTER COLUMN status SET DEFAULT false;
      ALTER TABLE "tblUsuario" ALTER COLUMN password SET DEFAULT false;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "tblUsuario" ALTER COLUMN status SET DEFAULT true;
      ALTER TABLE "tblUsuario" ALTER COLUMN password SET DEFAULT true;
    `);
  },
};
