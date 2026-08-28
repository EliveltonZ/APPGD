'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.renameColumn('tblProjetos', 'tipo_projeto', 'tipo_pedido');
  },

  async down(queryInterface) {
    await queryInterface.renameColumn('tblProjetos', 'tipo_pedido', 'tipo_projeto');
  },
};
