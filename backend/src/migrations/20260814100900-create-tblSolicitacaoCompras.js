'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('tblSolicitacaoCompras', {
      id: {
        type:          DataTypes.INTEGER,
        primaryKey:    true,
        autoIncrement: true,
        allowNull:     false,
      },
      data_solicitacao: {
        type:         DataTypes.DATE,
        allowNull:    false,
        defaultValue: DataTypes.NOW,
      },
      solicitante_id: {
        type:      DataTypes.INTEGER,
        allowNull: false,
      },
      observacoes: {
        type:      DataTypes.TEXT,
        allowNull: true,
      },
    }, { schema: 'public' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: 'tblSolicitacaoCompras', schema: 'public' });
  },
};
