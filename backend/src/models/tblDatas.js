const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblDatas', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.SMALLINT,
      allowNull: false,
      primaryKey: true
    },
    data: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tblDatas',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tbldatas_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
