'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn('tblProjetos', 'tipo_projeto', {
      type:         DataTypes.STRING(20),
      allowNull:    false,
      defaultValue: 'PROJETO',
    });
    await queryInterface.addColumn('tblProjetos', 'oc_origem', {
      type:      DataTypes.BIGINT,
      allowNull: true,
    });
    await queryInterface.addColumn('tblProjetos', 'motivo_assistencia', {
      type:      DataTypes.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('tblProjetos', 'motivo_assistencia');
    await queryInterface.removeColumn('tblProjetos', 'oc_origem');
    await queryInterface.removeColumn('tblProjetos', 'tipo_projeto');
  },
};
