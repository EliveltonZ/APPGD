'use strict';

// Hash do crachá (código de barras) de cada operador, usado pelo terminal
// público de apontamento pra identificar quem está fazendo a leitura sem
// precisar de login.
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tblUsuario', 'cracha_hash', {
      type: Sequelize.TEXT,
      allowNull: true,
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('tblUsuario', 'cracha_hash');
  },
};
