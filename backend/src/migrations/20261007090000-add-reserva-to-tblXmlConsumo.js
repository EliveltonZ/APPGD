'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      const table = 'tblXmlConsumo';
      // qtd_m2 passa a cobrir também ferragem (unidade_xml='UN', já vem pronta do XML
      // sem precisar de conversão) — renomeia pra refletir isso.
      await queryInterface.renameColumn(table, 'qtd_m2', 'qtd_xml', { transaction: t });
      await queryInterface.addColumn(table, 'unidade_xml', {
        type:         Sequelize.STRING(2),
        allowNull:    false,
        defaultValue: 'M2',
      }, { transaction: t });
      // Quantidade real consumida na baixa — pode divergir da reservada
      // (sobra reaproveitada em chapa, ou mais/menos uso em ferragem).
      await queryInterface.addColumn(table, 'qtd_un_baixada', {
        type: Sequelize.DECIMAL(10, 3), allowNull: true,
      }, { transaction: t });
      await queryInterface.addColumn(table, 'data_reserva', {
        type: Sequelize.DATE, allowNull: true,
      }, { transaction: t });
      await queryInterface.addColumn(table, 'usuario_reserva_id', {
        type: Sequelize.INTEGER, allowNull: true,
      }, { transaction: t });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      const table = 'tblXmlConsumo';
      await queryInterface.removeColumn(table, 'usuario_reserva_id', { transaction: t });
      await queryInterface.removeColumn(table, 'data_reserva',       { transaction: t });
      await queryInterface.removeColumn(table, 'qtd_un_baixada',     { transaction: t });
      await queryInterface.removeColumn(table, 'unidade_xml',        { transaction: t });
      await queryInterface.renameColumn(table, 'qtd_xml', 'qtd_m2',  { transaction: t });
    });
  },
};
