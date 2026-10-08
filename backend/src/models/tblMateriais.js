const T = require('../config/tables');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblMateriais', {
    id: {
      autoIncrement: true,
      type:          DataTypes.INTEGER,
      allowNull:     false,
      primaryKey:    true,
    },
    codigoInterno: {
      type:      DataTypes.STRING(50),
      allowNull: false,
      field:     'codigo_interno',
    },
    descricao: {
      type:      DataTypes.TEXT,
      allowNull: false,
    },
    unidadeBase: {
      type:      DataTypes.STRING(2),
      allowNull: false,
      field:     'unidade_base',
    },
    m2PorUnidade: {
      type:      DataTypes.DECIMAL(8, 4),
      allowNull: true,
      field:     'm2_por_unidade',
    },
    ultimoPrecoUn: {
      type:      DataTypes.DECIMAL(12, 4),
      allowNull: true,
      field:     'ultimo_preco_un',
    },
    dataUltimoPreco: {
      type:      DataTypes.DATEONLY,
      allowNull: true,
      field:     'data_ultimo_preco',
    },
    estoqueMinimoUn: {
      type:      DataTypes.DECIMAL(10, 3),
      allowNull: true,
      field:     'estoque_minimo_un',
    },
    ativo: {
      type:         DataTypes.BOOLEAN,
      allowNull:    false,
      defaultValue: true,
    },
    // Separado de `ativo` (que liga/desliga o material pra uso geral): marca
    // se o cadastro é confiável pro casamento automático do XML do Promob.
    // Material marcado como não revisado é tratado como se não tivesse
    // cadastro nenhum na tela de validação — força vínculo manual.
    cadastroRevisado: {
      type:         DataTypes.BOOLEAN,
      allowNull:    false,
      defaultValue: true,
      field:        'cadastro_revisado',
    },
  }, {
    sequelize,
    tableName:  T.materiais.name,
    schema:     'public',
    timestamps: false,
    indexes: [{ name: 'tblMateriais_pkey', unique: true, fields: [{ name: 'id' }] }],
  });
};
