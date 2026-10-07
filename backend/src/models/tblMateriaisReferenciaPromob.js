const T = require('../config/tables');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblMateriaisReferenciaPromob', {
    id: {
      autoIncrement: true,
      type:          DataTypes.INTEGER,
      allowNull:     false,
      primaryKey:    true,
    },
    referenciaPromob: {
      type:      DataTypes.STRING(100),
      allowNull: false,
      field:     'referencia_promob',
    },
    materialId: {
      type:      DataTypes.INTEGER,
      allowNull: false,
      field:     'material_id',
    },
    usuarioId: {
      type:      DataTypes.INTEGER,
      allowNull: false,
      field:     'usuario_id',
    },
    dataVinculo: {
      type:         DataTypes.DATE,
      allowNull:    false,
      defaultValue: DataTypes.NOW,
      field:        'data_vinculo',
    },
  }, {
    sequelize,
    tableName:  T.materiaisReferenciaPromob.name,
    schema:     'public',
    timestamps: false,
    indexes: [{ name: 'tblMateriaisReferenciaPromob_pkey', unique: true, fields: [{ name: 'id' }] }],
  });
};
