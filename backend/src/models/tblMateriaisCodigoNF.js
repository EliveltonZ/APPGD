const T = require('../config/tables');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblMateriaisCodigoNF', {
    id: {
      autoIncrement: true,
      type:          DataTypes.INTEGER,
      allowNull:     false,
      primaryKey:    true,
    },
    materialId: {
      type:      DataTypes.INTEGER,
      allowNull: false,
      field:     'material_id',
    },
    fornecedorId: {
      type:      DataTypes.BIGINT,
      allowNull: false,
      field:     'fornecedor_id',
    },
    codigoNf: {
      type:      DataTypes.STRING(100),
      allowNull: false,
      field:     'codigo_nf',
    },
    unidadeCompra: {
      type:      DataTypes.STRING(2),
      allowNull: false,
      field:     'unidade_compra',
    },
    m2PorUnidade: {
      type:      DataTypes.DECIMAL(8, 4),
      allowNull: true,
      field:     'm2_por_unidade',
    },
  }, {
    sequelize,
    tableName:  T.materiaisCodigoNF.name,
    schema:     'public',
    timestamps: false,
    indexes: [{ name: 'tblMateriaisCodigoNF_pkey', unique: true, fields: [{ name: 'id' }] }],
  });
};
