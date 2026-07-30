const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblOcorrencia', {
    cod: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.SMALLINT,
      allowNull: false,
      primaryKey: true
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    diasFabrica: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      field: 'dias_fabrica'
    },
    diasLogistica: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      field: 'dias_logistica'
    }
  }, {
    sequelize,
    tableName: 'tblOcorrencia',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tblOcorrencia_pkey",
        unique: true,
        fields: [
          { name: "cod" },
        ]
      },
    ]
  });
};
