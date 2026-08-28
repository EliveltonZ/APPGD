'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // A sessão do Postgres roda em UTC (não America/Sao_Paulo), então
  // DEFAULT CURRENT_DATE erra a data entre 21h e 23h59 no horário de Brasília.
  // A partir de agora quem preenche data_criacao é a aplicação (Node, com
  // timeZone: 'America/Sao_Paulo'), igual já é feito em paradasRepository/utilsRepository.
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      'ALTER TABLE "tblProjetos" ALTER COLUMN data_criacao DROP DEFAULT'
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      'ALTER TABLE "tblProjetos" ALTER COLUMN data_criacao SET DEFAULT CURRENT_DATE'
    );
  },
};
