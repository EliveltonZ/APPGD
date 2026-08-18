'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn('tblUsuario', 'cadastros_materiais', {
      type:         DataTypes.BOOLEAN,
      allowNull:    true,
      defaultValue: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('tblUsuario', 'cadastros_materiais');
  },
};
