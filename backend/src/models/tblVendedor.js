const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblVendedor', {
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
    tableName: 'tblVendedor',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tblVendedor_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
