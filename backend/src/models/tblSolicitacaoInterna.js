const T = require('../config/tables');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblSolicitacaoInterna', {
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
    quantidade: {
      type:      DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    usuarioId: {
      type:      DataTypes.INTEGER,
      allowNull: false,
      field:     'usuario_id',
    },
    dataSolicitacao: {
      type:         DataTypes.DATE,
      allowNull:    false,
      defaultValue: DataTypes.NOW,
      field:        'data_solicitacao',
    },
    observacao: {
      type:      DataTypes.TEXT,
      allowNull: true,
    },
    cancelada: {
      type:         DataTypes.BOOLEAN,
      allowNull:    false,
      defaultValue: false,
    },
    atendidaEm: {
      type:      DataTypes.DATE,
      allowNull: true,
      field:     'atendida_em',
    },
  }, {
    sequelize,
    tableName:  T.solicitacaoInterna.name,
    schema:     'public',
    timestamps: false,
    indexes: [{ name: 'tblSolicitacaoInterna_pkey', unique: true, fields: [{ name: 'id' }] }],
  });
};
