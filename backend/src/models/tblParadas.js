const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblParadas', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    pedido: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    data_inicio: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    data_fim: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_maquina: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    id_tipo: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  }, {
    sequelize,
    tableName: 'tblParadas',
    schema: 'public',
    timestamps: false,
  });
};
