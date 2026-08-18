const Sequelize = require('sequelize');
const T = require('../config/tables');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblConfig', {
    cod: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.SMALLINT,
      allowNull: false,
      primaryKey: true
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    diasFabrica: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      field: 'dias_fabrica'
    },
    diasLogistica: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      field: 'dias_logistica'
    }
  }, {
    sequelize,
    tableName: T.config.name,
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tblConfig_pkey",
        unique: true,
        fields: [
          { name: "cod" },
        ]
      },
    ]
  });
};
