const Sequelize = require('sequelize');
const T = require('../config/tables');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblCausaFalha', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    idFalha: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      field: 'id_falha'
    },
    idCausa: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      field: 'id_causa'
    }
  }, {
    sequelize,
    tableName: T.causaFalha.name,
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tblCausaFalha_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
