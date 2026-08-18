'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      const table = 'tblProjetos';
      await queryInterface.addColumn(table, 'supervisor',       { type: Sequelize.TEXT,     allowNull: true }, { transaction: t });
      await queryInterface.addColumn(table, 'tipo_solicitacao', { type: Sequelize.SMALLINT, allowNull: true }, { transaction: t });
      await queryInterface.addColumn(table, 'origem_montagem',  { type: Sequelize.BOOLEAN,  allowNull: true }, { transaction: t });
      await queryInterface.addColumn(table, 'origem_promob',    { type: Sequelize.BOOLEAN,  allowNull: true }, { transaction: t });
      await queryInterface.addColumn(table, 'origem_cobrada',   { type: Sequelize.BOOLEAN,  allowNull: true }, { transaction: t });
      await queryInterface.addColumn(table, 'observacoes',      { type: Sequelize.TEXT,     allowNull: true }, { transaction: t });
      await queryInterface.addColumn(table, 'solicitante',      { type: Sequelize.TEXT,     allowNull: true }, { transaction: t });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      const table = 'tblProjetos';
      await queryInterface.removeColumn(table, 'supervisor',       { transaction: t });
      await queryInterface.removeColumn(table, 'tipo_solicitacao', { transaction: t });
      await queryInterface.removeColumn(table, 'origem_montagem',  { transaction: t });
      await queryInterface.removeColumn(table, 'origem_promob',    { transaction: t });
      await queryInterface.removeColumn(table, 'origem_cobrada',   { transaction: t });
      await queryInterface.removeColumn(table, 'observacoes',      { transaction: t });
      await queryInterface.removeColumn(table, 'solicitante',      { transaction: t });
    });
  },
};
