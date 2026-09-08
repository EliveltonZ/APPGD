const Sequelize = require('sequelize');
const T = require('../config/tables');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblVendedor', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    regime: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: T.vendedor.name,
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tblVendedor_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
