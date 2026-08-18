'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('tblEstoqueMovimentos', {
      id: {
        type:          DataTypes.INTEGER,
        primaryKey:    true,
        autoIncrement: true,
        allowNull:     false,
      },
      material_id: {
        type:      DataTypes.INTEGER,
        allowNull: false,
      },
      localizacao_id: {
        type:      DataTypes.INTEGER,
        allowNull: false,
      },
      tipo: {
        type:      DataTypes.STRING(15),
        allowNull: false,
        comment:   'ENTRADA | BAIXA | AJUSTE | TRANSF_SAIDA | TRANSF_ENTRADA',
      },
      qtd_un: {
        type:      DataTypes.DECIMAL(10, 3),
        allowNull: false,
        comment:   'positivo: ENTRADA, TRANSF_ENTRADA | negativo: BAIXA, TRANSF_SAIDA',
      },
      preco_un: {
        type:      DataTypes.DECIMAL(12, 4),
        allowNull: true,
        comment:   'ENTRADA: preço da NF | BAIXA: snapshot de ultimo_preco_un',
      },
      fornecedor_id: {
        type:      DataTypes.BIGINT,
        allowNull: true,
        comment:   'preenchido na ENTRADA, NULL nas demais',
      },
      nf_item_id: {
        type:      DataTypes.INTEGER,
        allowNull: true,
        comment:   'preenchido na ENTRADA',
      },
      ordemdecompra: {
        type:      DataTypes.BIGINT,
        allowNull: true,
        comment:   'rastreabilidade: qual pedido consumiu este material',
      },
      xml_consumo_id: {
        type:      DataTypes.INTEGER,
        allowNull: true,
        comment:   'liga a baixa à necessidade do XML — N baixas por consumo',
      },
      transferencia_id: {
        type:      DataTypes.INTEGER,
        allowNull: true,
        comment:   'preenchido apenas em TRANSF_SAIDA / TRANSF_ENTRADA',
      },
      data: {
        type:         DataTypes.DATE,
        allowNull:    false,
        defaultValue: DataTypes.NOW,
      },
      usuario_id: {
        type:      DataTypes.INTEGER,
        allowNull: false,
      },
      observacoes: {
        type:      DataTypes.TEXT,
        allowNull: true,
      },
    }, { schema: 'public' });

    await queryInterface.addIndex('tblEstoqueMovimentos', ['material_id', 'localizacao_id'], {
      name: 'tblEstoqueMovimentos_material_local_idx',
    });
    await queryInterface.addIndex('tblEstoqueMovimentos', ['ordemdecompra'], {
      name: 'tblEstoqueMovimentos_oc_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: 'tblEstoqueMovimentos', schema: 'public' });
  },
};
