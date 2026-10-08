'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn('tblMateriais', 'cadastro_revisado', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('tblMateriais', 'cadastro_revisado');
  },
};
