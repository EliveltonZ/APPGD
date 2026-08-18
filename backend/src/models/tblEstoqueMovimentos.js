const T = require('../config/tables');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblEstoqueMovimentos', {
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
    localizacaoId: {
      type:      DataTypes.INTEGER,
      allowNull: false,
      field:     'localizacao_id',
    },
    tipo: {
      type:      DataTypes.STRING(15),
      allowNull: false,
    },
    qtdUn: {
      type:      DataTypes.DECIMAL(10, 3),
      allowNull: false,
      field:     'qtd_un',
    },
    precoUn: {
      type:      DataTypes.DECIMAL(12, 4),
      allowNull: true,
      field:     'preco_un',
    },
    fornecedorId: {
      type:      DataTypes.BIGINT,
      allowNull: true,
      field:     'fornecedor_id',
    },
    nfItemId: {
      type:      DataTypes.INTEGER,
      allowNull: true,
      field:     'nf_item_id',
    },
    ordemdecompra: {
      type:      DataTypes.BIGINT,
      allowNull: true,
    },
    xmlConsumoId: {
      type:      DataTypes.INTEGER,
      allowNull: true,
      field:     'xml_consumo_id',
    },
    transferenciaId: {
      type:      DataTypes.INTEGER,
      allowNull: true,
      field:     'transferencia_id',
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
    tableName:  T.estoqueMovimentos.name,
    schema:     'public',
    timestamps: false,
    indexes: [{ name: 'tblEstoqueMovimentos_pkey', unique: true, fields: [{ name: 'id' }] }],
  });
};
