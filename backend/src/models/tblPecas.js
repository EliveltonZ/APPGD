const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblPecas', {
    codigo: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    idAssistencia: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'id_assistencia'
    },
    qtd: {
      type: DataTypes.SMALLINT,
      allowNull: false
    },
    cor: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    peca: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dimensoes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    lado: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idOcorrencia: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      field: 'id_ocorrencia'
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idFalha: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      field: 'id_falha'
    },
    idCausa: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      defaultValue: 0,
      field: 'id_causa'
    },
    analise: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idErp: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      field: 'id_erp'
    }
  }, {
    sequelize,
    tableName: 'tblPecas',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tblPecas_pkey",
        unique: true,
        fields: [
          { name: "codigo" },
        ]
      },
    ]
  });
};
