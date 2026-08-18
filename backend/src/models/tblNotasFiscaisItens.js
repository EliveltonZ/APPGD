const T = require('../config/tables');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblNotasFiscaisItens', {
    id: {
      autoIncrement: true,
      type:          DataTypes.INTEGER,
      allowNull:     false,
      primaryKey:    true,
    },
    notaFiscalId: {
      type:      DataTypes.INTEGER,
      allowNull: false,
      field:     'nota_fiscal_id',
    },
    codigoNf: {
      type:      DataTypes.STRING(100),
      allowNull: true,
      field:     'codigo_nf',
    },
    materialId: {
      type:      DataTypes.INTEGER,
      allowNull: true,
      field:     'material_id',
    },
    descricaoNf: {
      type:      DataTypes.TEXT,
      allowNull: true,
      field:     'descricao_nf',
    },
    unidadeCompra: {
      type:      DataTypes.STRING(2),
      allowNull: false,
      field:     'unidade_compra',
    },
    qtdNf: {
      type:      DataTypes.DECIMAL(10, 3),
      allowNull: false,
      field:     'qtd_nf',
    },
    qtdUn: {
      type:      DataTypes.DECIMAL(10, 3),
      allowNull: false,
      field:     'qtd_un',
    },
    precoNf: {
      type:      DataTypes.DECIMAL(12, 4),
      allowNull: true,
      field:     'preco_nf',
    },
    precoUn: {
      type:      DataTypes.DECIMAL(12, 4),
      allowNull: true,
      field:     'preco_un',
    },
    total: {
      type:      DataTypes.DECIMAL(14, 2),
      allowNull: true,
    },
  }, {
    sequelize,
    tableName:  T.notasFiscaisItens.name,
    schema:     'public',
    timestamps: false,
    indexes: [{ name: 'tblNotasFiscaisItens_pkey', unique: true, fields: [{ name: 'id' }] }],
  });
};
