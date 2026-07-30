const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblMontador', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.SMALLINT,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tblMontador',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tblMontador_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
