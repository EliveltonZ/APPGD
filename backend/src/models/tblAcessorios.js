const Sequelize = require('sequelize');
const T = require('../config/tables');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblAcessorios', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    ordemdecompra: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'tblProjetos',
        key: 'ordemdecompra'
      }
    },
    categoria: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    parcelamento: {
      type: DataTypes.SMALLINT,
      allowNull: true
    },
    numcard: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    datacompra: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    previsao: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    qtd: {
      type: DataTypes.SMALLINT,
      allowNull: true
    },
    fornecedor: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    recebido: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    medida: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idCategoria: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      field: 'id_categoria'
    }
  }, {
    sequelize,
    tableName: T.acessorios.name,
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tblacessorios_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
