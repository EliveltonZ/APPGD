'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tblLiberador', 'regime', { type: Sequelize.TEXT, allowNull: true });
    await queryInterface.addColumn('tblLiberador', 'ativo',  { type: Sequelize.BOOLEAN, allowNull: true });
    await queryInterface.addColumn('tblVendedor', 'regime', { type: Sequelize.TEXT, allowNull: true });
    await queryInterface.addColumn('tblVendedor', 'ativo',  { type: Sequelize.BOOLEAN, allowNull: true });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('tblLiberador', 'regime');
    await queryInterface.removeColumn('tblLiberador', 'ativo');
    await queryInterface.removeColumn('tblVendedor', 'regime');
    await queryInterface.removeColumn('tblVendedor', 'ativo');
  },
};
