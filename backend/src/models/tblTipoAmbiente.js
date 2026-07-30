const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblTipoAmbiente', {
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
    tableName: 'tblTipoAmbiente',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tblTipoAmbiente_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
