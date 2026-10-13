const T = require('../config/tables');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblLocalizacoes', {
    id: {
      autoIncrement: true,
      type:          DataTypes.INTEGER,
      allowNull:     false,
      primaryKey:    true,
    },
    descricao: {
      type:      DataTypes.TEXT,
      allowNull: true,
    },
    rua: {
      type:      DataTypes.STRING(10),
      allowNull: false,
    },
    prateleira: {
      type:      DataTypes.STRING(10),
      allowNull: false,
    },
    nivel: {
      type:      DataTypes.STRING(10),
      allowNull: false,
    },
    divisao: {
      type:      DataTypes.STRING(10),
      allowNull: false,
    },
    ativo: {
      type:         DataTypes.BOOLEAN,
      allowNull:    false,
      defaultValue: true,
    },
    padraoRecebimento: {
      type:         DataTypes.BOOLEAN,
      allowNull:    false,
      defaultValue: false,
      field:        'padrao_recebimento',
    },
  }, {
    sequelize,
    tableName:  T.localizacoes.name,
    schema:     'public',
    timestamps: false,
    indexes: [{ name: 'tblLocalizacoes_pkey', unique: true, fields: [{ name: 'id' }] }],
  });
};
