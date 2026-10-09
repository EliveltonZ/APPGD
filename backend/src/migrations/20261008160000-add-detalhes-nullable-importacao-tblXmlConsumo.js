'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    // Item lançado na mão (liberação, acessório de terceiro) ainda não tem
    // uma importação de XML por trás — precisa poder existir sem uma.
    await queryInterface.changeColumn('tblXmlConsumo', 'importacao_id', {
      type: DataTypes.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('tblXmlConsumo', 'detalhes', {
      type: DataTypes.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('tblXmlConsumo', 'detalhes');
    await queryInterface.changeColumn('tblXmlConsumo', 'importacao_id', {
      type: DataTypes.INTEGER,
      allowNull: false,
    });
  },
};
