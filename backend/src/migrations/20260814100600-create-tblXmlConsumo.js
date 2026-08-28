'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('tblXmlConsumo', {
      id: {
        type:          DataTypes.INTEGER,
        primaryKey:    true,
        autoIncrement: true,
        allowNull:     false,
      },
      importacao_id: {
        type:      DataTypes.INTEGER,
        allowNull: false,
        comment:   'FK tblXmlImportacoes — rastreio do XML de origem',
      },
      ordemdecompra: {
        type:      DataTypes.BIGINT,
        allowNull: false,
      },
      material_id: {
        type:      DataTypes.INTEGER,
        allowNull: false,
      },
      apresentacao_id: {
        type:      DataTypes.INTEGER,
        allowNull: true,
        comment:   'FK tblMateriaisApresentacoes — fornece fator_conversao e preco_un para o cálculo',
      },
      unidade_consumo: {
        type:      DataTypes.STRING(2),
        allowNull: false,
        comment:   'M2 | M | UN — como a quantidade veio no XML',
      },
      qtd_consumo: {
        type:      DataTypes.DECIMAL(10, 4),
        allowNull: false,
        comment:   'quantidade na unidade do XML (M2, M ou UN)',
      },
      qtd_un_sugerida: {
        type:      DataTypes.DECIMAL(10, 3),
        allowNull: true,
        comment:   'TETO(qtd_consumo / fator_conversao) — quantas UNs de estoque separar',
      },
      qtd_un_confirmada: {
        type:      DataTypes.DECIMAL(10, 3),
        allowNull: true,
        comment:   'editável antes da baixa — default = qtd_un_sugerida',
      },
      preco_un_snapshot: {
        type:      DataTypes.DECIMAL(12, 4),
        allowNull: true,
        comment:   'ultimo_preco_un da apresentação no momento do import',
      },
      custo_calculado: {
        type:      DataTypes.DECIMAL(14, 2),
        allowNull: true,
        comment:   'qtd_consumo * (preco_un_snapshot / fator_conversao) — válido para M2, M e UN',
      },
      status: {
        type:         DataTypes.STRING(10),
        allowNull:    false,
        defaultValue: 'PENDENTE',
        comment:      'PENDENTE | EXECUTADO | CANCELADO',
      },
      data_importacao: {
        type:         DataTypes.DATE,
        allowNull:    false,
        defaultValue: DataTypes.NOW,
      },
      data_baixa: {
        type:      DataTypes.DATE,
        allowNull: true,
      },
      usuario_baixa_id: {
        type:      DataTypes.INTEGER,
        allowNull: true,
      },
    }, { schema: 'public' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: 'tblXmlConsumo', schema: 'public' });
  },
};
