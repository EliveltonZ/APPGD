'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // data_criacao já existe na tblProjetos (adicionada fora do fluxo de migrations,
    // sem default e sem uso no model até aqui) — só passamos a preenchê-la daqui pra frente.
    await queryInterface.sequelize.query(
      'ALTER TABLE "tblProjetos" ALTER COLUMN data_criacao SET DEFAULT CURRENT_DATE'
    );
    await queryInterface.renameColumn('tblProjetos', 'solicitante', 'responsavel');
    await queryInterface.renameColumn('tblProjetos', 'id_solicitante', 'id_responsavel');
  },

  async down(queryInterface) {
    await queryInterface.renameColumn('tblProjetos', 'id_responsavel', 'id_solicitante');
    await queryInterface.renameColumn('tblProjetos', 'responsavel', 'solicitante');
    await queryInterface.sequelize.query(
      'ALTER TABLE "tblProjetos" ALTER COLUMN data_criacao DROP DEFAULT'
    );
  },
};
