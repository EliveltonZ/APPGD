'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // "motorista" (quem entrega/executa a assistência, atribuído depois pela
    // Logística) é um papel distinto de "responsavel" (quem lançou o
    // pedido/assistência, convenção já usada por todo Projeto). Na tabela
    // antiga, tblAssistencias.responsavel tinha esse sentido de motorista, e
    // tblAssistencias.solicitante é que correspondia a "quem lançou".
    await queryInterface.addColumn('tblProjetos', 'motorista', {
      type: Sequelize.TEXT, allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('tblProjetos', 'motorista');
  },
};
