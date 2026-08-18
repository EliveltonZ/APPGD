const Sequelize = require('sequelize');
const T = require('../config/tables');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblTipoContrato', {
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
    tableName: T.tipoContrato.name,
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tblTipoContrato_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
