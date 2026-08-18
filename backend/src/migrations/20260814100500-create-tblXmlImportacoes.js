'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('tblXmlImportacoes', {
      id: {
        type:          DataTypes.INTEGER,
        primaryKey:    true,
        autoIncrement: true,
        allowNull:     false,
      },
      ordemdecompra: {
        type:      DataTypes.BIGINT,
        allowNull: false,
      },
      arquivo_nome: {
        type:      DataTypes.STRING(255),
        allowNull: true,
      },
      total_materiais: {
        type:      DataTypes.INTEGER,
        allowNull: true,
      },
      total_m2: {
        type:      DataTypes.DECIMAL(12, 4),
        allowNull: true,
      },
      data_importacao: {
        type:         DataTypes.DATE,
        allowNull:    false,
        defaultValue: DataTypes.NOW,
      },
      usuario_id: {
        type:      DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type:         DataTypes.STRING(15),
        allowNull:    false,
        defaultValue: 'PROCESSADO',
        comment:      'PROCESSADO | REVERTIDO',
      },
    }, { schema: 'public' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: 'tblXmlImportacoes', schema: 'public' });
  },
};
