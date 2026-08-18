'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('tblNotasFiscais', {
      id: {
        type:          DataTypes.INTEGER,
        primaryKey:    true,
        autoIncrement: true,
        allowNull:     false,
      },
      numero_nota: {
        type:      DataTypes.STRING(50),
        allowNull: false,
      },
      fornecedor_id: {
        type:      DataTypes.BIGINT,
        allowNull: false,
      },
      data_emissao: {
        type:      DataTypes.DATEONLY,
        allowNull: true,
      },
      data_entrada: {
        type:      DataTypes.DATEONLY,
        allowNull: false,
      },
      valor_total: {
        type:      DataTypes.DECIMAL(14, 2),
        allowNull: true,
      },
      usuario_id: {
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
    await queryInterface.dropTable({ tableName: 'tblNotasFiscais', schema: 'public' });
  },
};
