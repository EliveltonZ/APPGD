'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      const table = 'tblXmlConsumo';
      await queryInterface.sequelize.query(
        `UPDATE "${table}" SET status = 'LIBERADO' WHERE status = 'RESERVADO'`,
        { transaction: t },
      );
      await queryInterface.renameColumn(table, 'data_reserva', 'data_liberacao', { transaction: t });
      await queryInterface.renameColumn(table, 'usuario_reserva_id', 'usuario_liberacao_id', { transaction: t });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      const table = 'tblXmlConsumo';
      await queryInterface.renameColumn(table, 'usuario_liberacao_id', 'usuario_reserva_id', { transaction: t });
      await queryInterface.renameColumn(table, 'data_liberacao', 'data_reserva', { transaction: t });
      await queryInterface.sequelize.query(
        `UPDATE "${table}" SET status = 'RESERVADO' WHERE status = 'LIBERADO'`,
        { transaction: t },
      );
    });
  },
};
