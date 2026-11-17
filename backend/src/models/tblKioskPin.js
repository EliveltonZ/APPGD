const Sequelize = require('sequelize');
const T = require('../config/tables');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblKioskPin', {
    id: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      primaryKey: true,
    },
    pin: {
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
    tableName: T.kioskPin.name,
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tblKioskPin_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
