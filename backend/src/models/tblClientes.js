const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblClientes', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'tblClientes',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tblClientes_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
