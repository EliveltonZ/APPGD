const Sequelize = require('sequelize');
const T = require('../config/tables');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblLiberador', {
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
    tableName: T.liberador.name,
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tblLiberador_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
