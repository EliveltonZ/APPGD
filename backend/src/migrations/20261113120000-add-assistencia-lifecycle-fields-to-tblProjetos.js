'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      const table = 'tblProjetos';

      // Campos de ciclo de vida da Assistência que hoje só existem em
      // tblAssistencias — ficam null para todo PROJETO, só são usados em
      // linhas tipo_pedido='ASSISTENCIA'. Nomes/tipos espelham a tabela
      // antiga, exceto onde já existe equivalente real (corte→lote,
      // datasolicitacao→data_criacao) ou colisão de nome (pedido→
      // pedido_assistencia, que é outra numeração da de Projeto).
      await queryInterface.addColumn(table, 'montador', { type: Sequelize.TEXT, allowNull: true }, { transaction: t });
      await queryInterface.addColumn(table, 'conferente', { type: Sequelize.TEXT, allowNull: true }, { transaction: t });
      await queryInterface.addColumn(table, 'liberacao', { type: Sequelize.TEXT, allowNull: true }, { transaction: t });
      await queryInterface.addColumn(table, 'sem_material', { type: Sequelize.BOOLEAN, allowNull: true }, { transaction: t });
      await queryInterface.addColumn(table, 'impresso', { type: Sequelize.BOOLEAN, allowNull: true }, { transaction: t });
      await queryInterface.addColumn(table, 'producao', { type: Sequelize.BOOLEAN, allowNull: true }, { transaction: t });
      await queryInterface.addColumn(table, 'escritorio', { type: Sequelize.BOOLEAN, allowNull: true }, { transaction: t });
      await queryInterface.addColumn(table, 'data_agendamento', { type: Sequelize.DATEONLY, allowNull: true }, { transaction: t });
      await queryInterface.addColumn(table, 'finalizada', { type: Sequelize.BOOLEAN, allowNull: true }, { transaction: t });
      await queryInterface.addColumn(table, 'prazo_fabrica', { type: Sequelize.DATEONLY, allowNull: true }, { transaction: t });
      await queryInterface.addColumn(table, 'prazo_logistica', { type: Sequelize.DATEONLY, allowNull: true }, { transaction: t });
      await queryInterface.addColumn(table, 'observacoes2', { type: Sequelize.TEXT, allowNull: true }, { transaction: t });
      await queryInterface.addColumn(table, 'pedido_assistencia', { type: Sequelize.SMALLINT, allowNull: true }, { transaction: t });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      const table = 'tblProjetos';
      const columns = [
        'montador', 'conferente', 'liberacao', 'sem_material', 'impresso',
        'producao', 'escritorio', 'data_agendamento', 'finalizada',
        'prazo_fabrica', 'prazo_logistica', 'observacoes2', 'pedido_assistencia',
      ];
      for (const col of columns) {
        await queryInterface.removeColumn(table, col, { transaction: t });
      }
    });
  },
};
