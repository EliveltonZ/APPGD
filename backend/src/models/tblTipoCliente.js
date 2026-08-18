const Sequelize = require('sequelize');
const T = require('../config/tables');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblTipoCliente', {
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
    tableName: T.tipoCliente.name,
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tblTipoCliente_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
