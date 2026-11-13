'use strict';

// tblProjetos.data_criacao e DATEONLY (so data, sem hora) - serve bem pra
// Projeto, mas a Assistencia precisa da hora exata da solicitacao (mostrada
// na coluna "Data/Hora" de Producao/Logistica). Coluna nova, so usada em
// tipo_pedido='ASSISTENCIA'; Projeto continua usando so data_criacao.
module.exports = {
  async up(queryInterface) {
    // TIMESTAMP (sem tz) de propósito, igual tblAssistencias.datasolicitacao
    // — o app sempre grava/lê horário de Brasília "naive" (ver utils/dateBR.js,
    // fmtDate/parseNaiveBR). Usar DataTypes.DATE criaria TIMESTAMPTZ, que
    // reintroduziria o problema de fuso que esses helpers existem pra evitar.
    await queryInterface.sequelize.query(
      'ALTER TABLE "tblProjetos" ADD COLUMN data_solicitacao TIMESTAMP;'
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('tblProjetos', 'data_solicitacao');
  },
};
