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
      qtd_m2: {
        type:      DataTypes.DECIMAL(10, 4),
        allowNull: true,
        comment:   'apenas para materiais M2 — calculado do XML',
      },
      qtd_un_sugerida: {
        type:      DataTypes.DECIMAL(10, 3),
        allowNull: true,
        comment:   'M2: TETO(qtd_m2 / m2_por_unidade) | UN: não se aplica',
      },
      qtd_un_confirmada: {
        type:      DataTypes.DECIMAL(10, 3),
        allowNull: true,
        comment:   'editável antes da baixa — M2: default = sugerida | UN: qtd do XML',
      },
      preco_un_snapshot: {
        type:      DataTypes.DECIMAL(12, 4),
        allowNull: true,
        comment:   'ultimo_preco_un no momento da baixa',
      },
      custo_calculado: {
        type:      DataTypes.DECIMAL(14, 2),
        allowNull: true,
        comment:   'M2: qtd_m2 * (preco_un_snapshot / m2_por_unidade) | UN: qtd_un_confirmada * preco_un_snapshot',
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
