const T = require('../config/tables');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblTransferencias', {
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
    localizacaoOrigemId: {
      type:      DataTypes.INTEGER,
      allowNull: false,
      field:     'localizacao_origem_id',
    },
    localizacaoDestinoId: {
      type:      DataTypes.INTEGER,
      allowNull: false,
      field:     'localizacao_destino_id',
    },
    qtdUn: {
      type:      DataTypes.DECIMAL(10, 3),
      allowNull: false,
      field:     'qtd_un',
    },
    data: {
      type:         DataTypes.DATE,
      allowNull:    false,
      defaultValue: DataTypes.NOW,
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
    tableName:  T.transferencias.name,
    schema:     'public',
    timestamps: false,
    indexes: [{ name: 'tblTransferencias_pkey', unique: true, fields: [{ name: 'id' }] }],
  });
};
