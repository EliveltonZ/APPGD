'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('tblMateriaisCodigoNF', {
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
      fornecedor_id: {
        type:      DataTypes.BIGINT,
        allowNull: false,
      },
      codigo_nf: {
        type:      DataTypes.STRING(100),
        allowNull: false,
      },
      unidade_compra: {
        type:      DataTypes.STRING(2),
        allowNull: false,
        comment:   'UN ou M2 — como o fornecedor vende',
      },
      m2_por_unidade: {
        type:      DataTypes.DECIMAL(8, 4),
        allowNull: true,
        comment:   'substitui o default do material para este fornecedor',
      },
    }, { schema: 'public' });

    await queryInterface.addIndex('tblMateriaisCodigoNF', ['material_id', 'fornecedor_id', 'codigo_nf'], {
      unique: true,
      name:   'tblMateriaisCodigoNF_material_fornecedor_codigo_uq',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: 'tblMateriaisCodigoNF', schema: 'public' });
  },
};
