'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('tblSolicitacaoInterna', {
      id: {
        type:          DataTypes.INTEGER,
        primaryKey:    true,
        autoIncrement: true,
        allowNull:     false,
      },
      material_id: {
        type:      DataTypes.INTEGER,
        allowNull: false,
        comment:   'ferramenta, EPI, limpeza, peça de máquina etc. — sempre um material cadastrado',
      },
      quantidade: {
        type:      DataTypes.DECIMAL(10, 3),
        allowNull: false,
      },
      usuario_id: {
        type:      DataTypes.INTEGER,
        allowNull: false,
        comment:   'quem solicitou',
      },
      data_solicitacao: {
        type:         DataTypes.DATE,
        allowNull:    false,
        defaultValue: DataTypes.NOW,
      },
      observacao: {
        type:      DataTypes.TEXT,
        allowNull: true,
      },
      cancelada: {
        type:         DataTypes.BOOLEAN,
        allowNull:    false,
        defaultValue: false,
      },
      atendida_em: {
        type:      DataTypes.DATE,
        allowNull: true,
        comment:   'preenchida quando o material entra num orçamento de compra — não aparece mais como pendente',
      },
    }, { schema: 'public' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: 'tblSolicitacaoInterna', schema: 'public' });
  },
};
