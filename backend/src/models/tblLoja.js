const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblLoja', {
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
    tableName: 'tblLoja',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tblLoja_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
