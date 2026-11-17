'use strict';

// Linha única com o PIN atual do terminal de apontamento público. Gerado
// (e regerado) pela tela "PIN do Terminal" em Configurações — ver
// kioskPinRepository.js. Regenerar invalida o PIN anterior.
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tblKioskPin', {
      id: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        primaryKey: true,
      },
      pin: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      atualizado_em: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tblKioskPin');
  },
};
