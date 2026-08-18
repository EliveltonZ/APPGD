'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('tblTransferencias', {
      id: {
        type:          DataTypes.INTEGER,
        primaryKey:    true,
        autoIncrement: true,
        allowNull:     false,
      },
      material_id: {
        type:      DataTypes.INTEGER,
        allowNull: false,
      },
      localizacao_origem_id: {
        type:      DataTypes.INTEGER,
        allowNull: false,
      },
      localizacao_destino_id: {
        type:      DataTypes.INTEGER,
        allowNull: false,
      },
      qtd_un: {
        type:      DataTypes.DECIMAL(10, 3),
        allowNull: false,
      },
      data: {
        type:         DataTypes.DATE,
        allowNull:    false,
        defaultValue: DataTypes.NOW,
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
    await queryInterface.dropTable({ tableName: 'tblTransferencias', schema: 'public' });
  },
};
