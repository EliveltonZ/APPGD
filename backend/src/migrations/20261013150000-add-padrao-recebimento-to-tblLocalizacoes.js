'use strict';
const { DataTypes } = require('sequelize');

// Marca qual localização é a "doca de recebimento" padrão — toda nota
// fiscal lançada entra automaticamente nela (sem o usuário escolher),
// e os responsáveis transferem pra localização definitiva depois
// (reaproveitando Transferências, que já existe). Índice parcial único
// garante que só uma localização por vez pode ser a padrão.
module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn('tblLocalizacoes', 'padrao_recebimento', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addIndex('tblLocalizacoes', ['padrao_recebimento'], {
      unique: true,
      name: 'tblLocalizacoes_padrao_recebimento_uq',
      where: { padrao_recebimento: true },
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('tblLocalizacoes', 'tblLocalizacoes_padrao_recebimento_uq');
    await queryInterface.removeColumn('tblLocalizacoes', 'padrao_recebimento');
  },
};
