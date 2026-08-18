const T = require('../config/tables');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblSolicitacaoComprasItens', {
    id: {
      autoIncrement: true,
      type:          DataTypes.INTEGER,
      allowNull:     false,
      primaryKey:    true,
    },
    solicitacaoId: {
      type:      DataTypes.INTEGER,
      allowNull: false,
      field:     'solicitacao_id',
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
    fornecedorId: {
      type:      DataTypes.BIGINT,
      allowNull: true,
      field:     'fornecedor_id',
    },
    dataPedido: {
      type:      DataTypes.DATEONLY,
      allowNull: true,
      field:     'data_pedido',
    },
    dataComprado: {
      type:      DataTypes.DATEONLY,
      allowNull: true,
      field:     'data_comprado',
    },
    nfItemId: {
      type:      DataTypes.INTEGER,
      allowNull: true,
      field:     'nf_item_id',
    },
    precoUn: {
      type:      DataTypes.DECIMAL(12, 4),
      allowNull: true,
      field:     'preco_un',
    },
    observacoes: {
      type:      DataTypes.TEXT,
      allowNull: true,
    },
    usuarioId: {
      type:      DataTypes.INTEGER,
      allowNull: false,
      field:     'usuario_id',
    },
  }, {
    sequelize,
    tableName:  T.solicitacaoComprasItens.name,
    schema:     'public',
    timestamps: false,
    indexes: [{ name: 'tblSolicitacaoComprasItens_pkey', unique: true, fields: [{ name: 'id' }] }],
  });
};
