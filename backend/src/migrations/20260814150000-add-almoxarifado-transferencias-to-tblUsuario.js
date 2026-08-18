'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tblUsuario', 'almoxarifado_transferencias', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('tblUsuario', 'almoxarifado_transferencias');
  },
};
