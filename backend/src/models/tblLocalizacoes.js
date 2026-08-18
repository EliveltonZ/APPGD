const T = require('../config/tables');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblLocalizacoes', {
    id: {
      autoIncrement: true,
      type:          DataTypes.INTEGER,
      allowNull:     false,
      primaryKey:    true,
    },
    codigo: {
      type:      DataTypes.STRING(30),
      allowNull: false,
    },
    descricao: {
      type:      DataTypes.TEXT,
      allowNull: true,
    },
    ativo: {
      type:         DataTypes.BOOLEAN,
      allowNull:    false,
      defaultValue: true,
    },
  }, {
    sequelize,
    tableName:  T.localizacoes.name,
    schema:     'public',
    timestamps: false,
    indexes: [{ name: 'tblLocalizacoes_pkey', unique: true, fields: [{ name: 'id' }] }],
  });
};
