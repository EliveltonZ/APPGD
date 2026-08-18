'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      "CREATE SEQUENCE seq_assistencia_oc START 2000000001 INCREMENT 1;"
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "DROP SEQUENCE IF EXISTS seq_assistencia_oc;"
    );
  },
};
