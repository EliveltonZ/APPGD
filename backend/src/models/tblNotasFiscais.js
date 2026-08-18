const T = require('../config/tables');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblNotasFiscais', {
    id: {
      autoIncrement: true,
      type:          DataTypes.INTEGER,
      allowNull:     false,
      primaryKey:    true,
    },
    numeroNota: {
      type:      DataTypes.STRING(50),
      allowNull: false,
      field:     'numero_nota',
    },
    fornecedorId: {
      type:      DataTypes.BIGINT,
      allowNull: false,
      field:     'fornecedor_id',
    },
    dataEmissao: {
      type:      DataTypes.DATEONLY,
      allowNull: true,
      field:     'data_emissao',
    },
    dataEntrada: {
      type:      DataTypes.DATEONLY,
      allowNull: false,
      field:     'data_entrada',
    },
    valorTotal: {
      type:      DataTypes.DECIMAL(14, 2),
      allowNull: true,
      field:     'valor_total',
    },
    usuarioId: {
      type:      DataTypes.INTEGER,
      allowNull: false,
      field:     'usuario_id',
    },
    observacoes: {
      type:      DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    tableName:  T.notasFiscais.name,
    schema:     'public',
    timestamps: false,
    indexes: [{ name: 'tblNotasFiscais_pkey', unique: true, fields: [{ name: 'id' }] }],
  });
};
