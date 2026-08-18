'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('tblLocalizacoes', {
      id: {
        type:          DataTypes.INTEGER,
        primaryKey:    true,
        autoIncrement: true,
        allowNull:     false,
      },
      codigo: {
        type:      DataTypes.STRING(30),
        allowNull: false,
        unique:    true,
      },
      descricao: {
        type:      DataTypes.TEXT,
        allowNull: true,
      },
      ativo: {
        type:         DataTypes.BOOLEAN,
        allowNull:    false,
        defaultValue: true,
      },
    }, { schema: 'public' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: 'tblLocalizacoes', schema: 'public' });
  },
};
