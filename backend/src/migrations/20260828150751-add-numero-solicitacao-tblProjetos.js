'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tblProjetos', 'numero_solicitacao', {
      type: Sequelize.TEXT,
      allowNull: true,
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('tblProjetos', 'numero_solicitacao');
  },
};
