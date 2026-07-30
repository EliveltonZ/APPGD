const Sequelize = require('sequelize');
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
    }
  }, {
    sequelize,
    tableName: 'tblFornecedores',
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
