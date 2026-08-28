'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('tblProjetos', 'oc_origem');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('tblProjetos', 'oc_origem', {
      type: Sequelize.BIGINT,
      allowNull: true,
    });
  },
};
