const Sequelize = require('sequelize');
const T = require('../config/tables');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblLoja', {
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
    }
  }, {
    sequelize,
    tableName: T.loja.name,
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tblLoja_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
