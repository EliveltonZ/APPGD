const Sequelize = require('sequelize');
const T = require('../config/tables');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblCorSetor', {
    setor: {
      type: DataTypes.TEXT,
      allowNull: false,
      primaryKey: true,
    },
    cor: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    atualizadoEm: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'atualizado_em',
    },
  }, {
    sequelize,
    tableName: T.corSetor.name,
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tblCorSetor_pkey",
        unique: true,
        fields: [
          { name: "setor" },
        ]
      },
    ]
  });
};
