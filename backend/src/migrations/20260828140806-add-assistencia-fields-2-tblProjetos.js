'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      const table = 'tblProjetos';
      await queryInterface.addColumn(table, 'bairro',         { type: Sequelize.TEXT,    allowNull: true }, { transaction: t });
      await queryInterface.addColumn(table, 'tempo',           { type: Sequelize.TEXT,    allowNull: true }, { transaction: t });
      await queryInterface.addColumn(table, 'destino',         { type: Sequelize.TEXT,    allowNull: true }, { transaction: t });
      await queryInterface.addColumn(table, 'origem_entrega',  { type: Sequelize.BOOLEAN, allowNull: true }, { transaction: t });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      const table = 'tblProjetos';
      await queryInterface.removeColumn(table, 'bairro',        { transaction: t });
      await queryInterface.removeColumn(table, 'tempo',          { transaction: t });
      await queryInterface.removeColumn(table, 'destino',        { transaction: t });
      await queryInterface.removeColumn(table, 'origem_entrega', { transaction: t });
    });
  },
};
