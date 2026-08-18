const T = require('../config/tables');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblXmlConsumo', {
    id: {
      autoIncrement: true,
      type:          DataTypes.INTEGER,
      allowNull:     false,
      primaryKey:    true,
    },
    importacaoId: {
      type:      DataTypes.INTEGER,
      allowNull: false,
      field:     'importacao_id',
    },
    ordemdecompra: {
      type:      DataTypes.BIGINT,
      allowNull: false,
    },
    materialId: {
      type:      DataTypes.INTEGER,
      allowNull: false,
      field:     'material_id',
    },
    qtdM2: {
      type:      DataTypes.DECIMAL(10, 4),
      allowNull: true,
      field:     'qtd_m2',
    },
    qtdUnSugerida: {
      type:      DataTypes.DECIMAL(10, 3),
      allowNull: true,
      field:     'qtd_un_sugerida',
    },
    qtdUnConfirmada: {
      type:      DataTypes.DECIMAL(10, 3),
      allowNull: true,
      field:     'qtd_un_confirmada',
    },
    precoUnSnapshot: {
      type:      DataTypes.DECIMAL(12, 4),
      allowNull: true,
      field:     'preco_un_snapshot',
    },
    custoCalculado: {
      type:      DataTypes.DECIMAL(14, 2),
      allowNull: true,
      field:     'custo_calculado',
    },
    status: {
      type:         DataTypes.STRING(10),
      allowNull:    false,
      defaultValue: 'PENDENTE',
    },
    dataImportacao: {
      type:         DataTypes.DATE,
      allowNull:    false,
      defaultValue: DataTypes.NOW,
      field:        'data_importacao',
    },
    dataBaixa: {
      type:      DataTypes.DATE,
      allowNull: true,
      field:     'data_baixa',
    },
    usuarioBaixaId: {
      type:      DataTypes.INTEGER,
      allowNull: true,
      field:     'usuario_baixa_id',
    },
  }, {
    sequelize,
    tableName:  T.xmlConsumo.name,
    schema:     'public',
    timestamps: false,
    indexes: [{ name: 'tblXmlConsumo_pkey', unique: true, fields: [{ name: 'id' }] }],
  });
};
