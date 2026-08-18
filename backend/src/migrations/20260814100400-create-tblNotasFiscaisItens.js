'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('tblNotasFiscaisItens', {
      id: {
        type:          DataTypes.INTEGER,
        primaryKey:    true,
        autoIncrement: true,
        allowNull:     false,
      },
      nota_fiscal_id: {
        type:      DataTypes.INTEGER,
        allowNull: false,
      },
      codigo_nf: {
        type:      DataTypes.STRING(100),
        allowNull: true,
      },
      material_id: {
        type:      DataTypes.INTEGER,
        allowNull: true,
        comment:   'NULL se item da nota não vinculado ao catálogo',
      },
      descricao_nf: {
        type:      DataTypes.TEXT,
        allowNull: true,
      },
      unidade_compra: {
        type:      DataTypes.STRING(2),
        allowNull: false,
        comment:   'UN ou M2 — como veio na nota',
      },
      qtd_nf: {
        type:      DataTypes.DECIMAL(10, 3),
        allowNull: false,
      },
      qtd_un: {
        type:      DataTypes.DECIMAL(10, 3),
        allowNull: false,
        comment:   'quantidade normalizada para estoque em UN',
      },
      preco_nf: {
        type:      DataTypes.DECIMAL(12, 4),
        allowNull: true,
        comment:   'preço unitário original (UN ou M2)',
      },
      preco_un: {
        type:      DataTypes.DECIMAL(12, 4),
        allowNull: true,
        comment:   'preço normalizado por UN',
      },
      total: {
        type:      DataTypes.DECIMAL(14, 2),
        allowNull: true,
      },
    }, { schema: 'public' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: 'tblNotasFiscaisItens', schema: 'public' });
  },
};
