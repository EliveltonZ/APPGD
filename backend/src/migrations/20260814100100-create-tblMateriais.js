'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('tblMateriais', {
      id: {
        type:          DataTypes.INTEGER,
        primaryKey:    true,
        autoIncrement: true,
        allowNull:     false,
      },
      codigo_interno: {
        type:      DataTypes.STRING(50),
        allowNull: false,
        unique:    true,
      },
      descricao: {
        type:      DataTypes.TEXT,
        allowNull: false,
      },
      unidade_base: {
        type:      DataTypes.STRING(2),
        allowNull: false,
        comment:   'M2 = conversão ativa | UN = baixa 1:1',
      },
      espessura: {
        type:      DataTypes.DECIMAL(6, 2),
        allowNull: true,
      },
      m2_por_unidade: {
        type:      DataTypes.DECIMAL(8, 4),
        allowNull: true,
        comment:   'NULL se unidade_base = UN | default 5.0416 (2740x1840mm) se M2',
      },
      ultimo_preco_un: {
        type:      DataTypes.DECIMAL(12, 4),
        allowNull: true,
      },
      data_ultimo_preco: {
        type:      DataTypes.DATEONLY,
        allowNull: true,
      },
      estoque_minimo_un: {
        type:      DataTypes.DECIMAL(10, 3),
        allowNull: true,
        comment:   'NULL = sem controle de mínimo',
      },
      ativo: {
        type:         DataTypes.BOOLEAN,
        allowNull:    false,
        defaultValue: true,
      },
    }, { schema: 'public' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: 'tblMateriais', schema: 'public' });
  },
};
