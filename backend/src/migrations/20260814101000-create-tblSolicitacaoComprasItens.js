'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('tblSolicitacaoComprasItens', {
      id: {
        type:          DataTypes.INTEGER,
        primaryKey:    true,
        autoIncrement: true,
        allowNull:     false,
      },
      solicitacao_id: {
        type:      DataTypes.INTEGER,
        allowNull: false,
      },
      material_id: {
        type:      DataTypes.INTEGER,
        allowNull: false,
      },
      quantidade: {
        type:      DataTypes.DECIMAL(10, 3),
        allowNull: false,
      },
      fornecedor_id: {
        type:      DataTypes.BIGINT,
        allowNull: true,
        comment:   'sugestão de fornecedor — pode ser alterado na compra',
      },
      data_pedido: {
        type:      DataTypes.DATEONLY,
        allowNull: true,
        comment:   'NULL = pedido ainda não gerado ao fornecedor',
      },
      data_comprado: {
        type:      DataTypes.DATEONLY,
        allowNull: true,
        comment:   'preenchida + data_pedido → status COMPRADO',
      },
      nf_item_id: {
        type:      DataTypes.INTEGER,
        allowNull: true,
        comment:   'preenchido ao lançar NF → status RECEBIDO automático',
      },
      preco_un: {
        type:      DataTypes.DECIMAL(12, 4),
        allowNull: true,
        comment:   'preenchido quando comprado — histórico de preço',
      },
      observacoes: {
        type:      DataTypes.TEXT,
        allowNull: true,
      },
      usuario_id: {
        type:      DataTypes.INTEGER,
        allowNull: false,
      },
    }, { schema: 'public' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: 'tblSolicitacaoComprasItens', schema: 'public' });
  },
};
