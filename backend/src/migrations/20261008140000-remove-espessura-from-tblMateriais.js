'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('tblMateriais', 'espessura');
  },

  async down(queryInterface) {
    await queryInterface.addColumn('tblMateriais', 'espessura', {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
    });
  },
};
