const T = require('../config/tables');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblXmlImportacoes', {
    id: {
      autoIncrement: true,
      type:          DataTypes.INTEGER,
      allowNull:     false,
      primaryKey:    true,
    },
    ordemdecompra: {
      type:      DataTypes.BIGINT,
      allowNull: false,
    },
    arquivoNome: {
      type:      DataTypes.STRING(255),
      allowNull: true,
      field:     'arquivo_nome',
    },
    totalMateriais: {
      type:      DataTypes.INTEGER,
      allowNull: true,
      field:     'total_materiais',
    },
    totalM2: {
      type:      DataTypes.DECIMAL(12, 4),
      allowNull: true,
      field:     'total_m2',
    },
    dataImportacao: {
      type:         DataTypes.DATE,
      allowNull:    false,
      defaultValue: DataTypes.NOW,
      field:        'data_importacao',
    },
    usuarioId: {
      type:      DataTypes.INTEGER,
      allowNull: false,
      field:     'usuario_id',
    },
    status: {
      type:         DataTypes.STRING(15),
      allowNull:    false,
      defaultValue: 'PROCESSADO',
    },
  }, {
    sequelize,
    tableName:  T.xmlImportacoes.name,
    schema:     'public',
    timestamps: false,
    indexes: [{ name: 'tblXmlImportacoes_pkey', unique: true, fields: [{ name: 'id' }] }],
  });
};
