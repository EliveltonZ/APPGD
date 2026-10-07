'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('tblMateriaisReferenciaPromob', {
      id: {
        type:          DataTypes.INTEGER,
        primaryKey:    true,
        autoIncrement: true,
        allowNull:     false,
      },
      referencia_promob: {
        type:      DataTypes.STRING(100),
        allowNull: false,
      },
      material_id: {
        type:      DataTypes.INTEGER,
        allowNull: false,
      },
      usuario_id: {
        type:      DataTypes.INTEGER,
        allowNull: false,
      },
      data_vinculo: {
        type:         DataTypes.DATE,
        allowNull:    false,
        defaultValue: DataTypes.NOW,
      },
    }, { schema: 'public' });

    await queryInterface.addIndex('tblMateriaisReferenciaPromob', ['referencia_promob'], {
      unique: true,
      name:   'tblMateriaisReferenciaPromob_referencia_uq',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: 'tblMateriaisReferenciaPromob', schema: 'public' });
  },
};
