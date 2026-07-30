const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblLiberador', {
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
    tableName: 'tblLiberador',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tblLiberador_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
