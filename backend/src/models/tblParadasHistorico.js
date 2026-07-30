const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblParadasHistorico', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    parada_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    campo: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    valor_anterior: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    valor_novo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    alterado_por: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    alterado_em: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    tableName: 'tblParadasHistorico',
    schema: 'public',
    timestamps: false,
  });
};
