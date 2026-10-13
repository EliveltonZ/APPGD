'use strict';
const { DataTypes } = require('sequelize');

// unidade_compra era STRING(2) (pensado só pra UN/M2) — XML real de NF-e traz
// códigos de até 3+ caracteres (ex.: "CLL" de caixa/conjunto, além de "CH",
// "RL" etc.), então STRING(2) rejeitaria inserts legítimos vindos da leitura
// automática do XML.
module.exports = {
  async up(queryInterface) {
    await queryInterface.changeColumn('tblNotasFiscaisItens', 'unidade_compra', {
      type: DataTypes.STRING(10),
      allowNull: false,
    });
    await queryInterface.changeColumn('tblMateriaisCodigoNF', 'unidade_compra', {
      type: DataTypes.STRING(10),
      allowNull: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.changeColumn('tblNotasFiscaisItens', 'unidade_compra', {
      type: DataTypes.STRING(2),
      allowNull: false,
    });
    await queryInterface.changeColumn('tblMateriaisCodigoNF', 'unidade_compra', {
      type: DataTypes.STRING(2),
      allowNull: false,
    });
  },
};
