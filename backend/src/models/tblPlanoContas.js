const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblPlanoContas', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    codigo: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    contaCompra: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'conta_compra'
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    tableName: 'tblPlanoContas',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "idx_planocontas_compra",
        fields: [
          { name: "conta_compra" },
        ]
      },
      {
        name: "tblPlanoContas_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
