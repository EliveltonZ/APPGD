'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      const table = 'tblMateriaisCodigoNF';
      await queryInterface.addColumn(table, 'criado_por_id', {
        type: Sequelize.INTEGER, allowNull: true,
      }, { transaction: t });
      await queryInterface.addColumn(table, 'criado_em', {
        type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW'),
      }, { transaction: t });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      const table = 'tblMateriaisCodigoNF';
      await queryInterface.removeColumn(table, 'criado_em',    { transaction: t });
      await queryInterface.removeColumn(table, 'criado_por_id', { transaction: t });
    });
  },
};
