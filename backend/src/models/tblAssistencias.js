const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblAssistencias', {
    solicitacao: {
      type: DataTypes.TEXT,
      allowNull: false,
      primaryKey: true
    },
    contrato: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    cliente: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    ambiente: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    datasolicitacao: {
      type: DataTypes.DATE,
      allowNull: true
    },
    iniciado: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    previsao: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    pronto: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    dataentrega: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    solicitante: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    montador: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    responsavel: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    conferente: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    urgente: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    liberacao: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    semMaterial: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'sem_material'
    },
    impresso: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    montagem: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    producao: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    escritorio: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    observacoes2: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    pecas: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    corte: {
      type: DataTypes.SMALLINT,
      allowNull: true
    },
    promob: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    entrega: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    dataagendamento: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    bairro: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tempo: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    destino: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    finalizada: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    prazof: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    prazol: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    supervisor: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    pedido: {
      type: DataTypes.SMALLINT,
      allowNull: true
    },
    cobrada: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    tipoassistencia: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      defaultValue: 0
    },
    pendencia: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    }
  }, {
    sequelize,
    tableName: 'tblAssistencias',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tblAssistencias_pkey",
        unique: true,
        fields: [
          { name: "solicitacao" },
        ]
      },
    ]
  });
};
