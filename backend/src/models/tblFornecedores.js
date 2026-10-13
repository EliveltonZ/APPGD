const Sequelize = require('sequelize');
const T = require('../config/tables');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblFornecedores', {
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
    cnpj: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    contato: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    inscricaoEstadual: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'inscricao_estadual'
    },
    endereco: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    numero: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    bairro: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cidade: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cep: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    estado: {
      type: DataTypes.STRING(2),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: T.fornecedores.name,
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tblFornecedores_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
