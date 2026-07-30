const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblCentrosCusto', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    nome: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    grupo: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    tableName: 'tblCentrosCusto',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tblCentrosCusto_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
