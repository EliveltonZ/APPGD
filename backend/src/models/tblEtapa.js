const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblEtapa', {
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
    tableName: 'tblEtapa',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tblEtapa_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
