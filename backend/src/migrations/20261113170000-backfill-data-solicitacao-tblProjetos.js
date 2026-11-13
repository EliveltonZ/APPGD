'use strict';

// Preenche data_solicitacao (hora exata da solicitacao) pra toda assistencia
// ja migrada, relendo o valor original de tblAssistencias (ainda intacta).
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE "tblProjetos" proj
      SET data_solicitacao = a.datasolicitacao
      FROM "tblAssistencias" a
      WHERE proj.tipo_pedido = 'ASSISTENCIA'
        AND proj.numero_solicitacao = a.solicitacao;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE "tblProjetos" SET data_solicitacao = NULL WHERE tipo_pedido = 'ASSISTENCIA';
    `);
  },
};
