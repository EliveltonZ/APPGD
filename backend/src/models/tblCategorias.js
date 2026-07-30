const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblCategorias', {
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
    }
  }, {
    sequelize,
    tableName: 'tblCategorias',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tblCategorias_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
