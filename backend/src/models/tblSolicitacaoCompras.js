const T = require('../config/tables');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblSolicitacaoCompras', {
    id: {
      autoIncrement: true,
      type:          DataTypes.INTEGER,
      allowNull:     false,
      primaryKey:    true,
    },
    dataSolicitacao: {
      type:         DataTypes.DATE,
      allowNull:    false,
      defaultValue: DataTypes.NOW,
      field:        'data_solicitacao',
    },
    solicitanteId: {
      type:      DataTypes.INTEGER,
      allowNull: false,
      field:     'solicitante_id',
    },
    observacoes: {
      type:      DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    tableName:  T.solicitacaoCompras.name,
    schema:     'public',
    timestamps: false,
    indexes: [{ name: 'tblSolicitacaoCompras_pkey', unique: true, fields: [{ name: 'id' }] }],
  });
};
