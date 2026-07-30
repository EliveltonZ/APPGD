const Sequelize = require('sequelize');
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
    tableName: 'tblTipoCliente',
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
