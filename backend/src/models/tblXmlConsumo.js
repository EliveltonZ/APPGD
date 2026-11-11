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
      // Item lançado na mão (fora de uma importação de XML) não tem isso —
      // ver campo `origem` derivado (null = MANUAL, preenchido = XML).
      allowNull: true,
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
    qtdXml: {
      type:      DataTypes.DECIMAL(10, 4),
      allowNull: true,
      field:     'qtd_xml',
    },
    unidadeXml: {
      type:         DataTypes.STRING(2),
      allowNull:    false,
      defaultValue: 'M2',
      field:        'unidade_xml',
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
      // PENDENTE | LIBERADO | EXECUTADO | CANCELADO
    },
    qtdUnBaixada: {
      type:      DataTypes.DECIMAL(10, 3),
      allowNull: true,
      field:     'qtd_un_baixada',
    },
    detalhes: {
      type:      DataTypes.TEXT,
      allowNull: true,
    },
    dataImportacao: {
      type:         DataTypes.DATE,
      allowNull:    false,
      defaultValue: DataTypes.NOW,
      field:        'data_importacao',
    },
    dataLiberacao: {
      type:      DataTypes.DATE,
      allowNull: true,
      field:     'data_liberacao',
    },
    usuarioLiberacaoId: {
      type:      DataTypes.INTEGER,
      allowNull: true,
      field:     'usuario_liberacao_id',
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
