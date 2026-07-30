const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblProducao', {
    ordemdecompra: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    corteinicio: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cortefim: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cortepausa: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    corteresp: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      defaultValue: 0
    },
    customizacaoinicio: {
      type: DataTypes.DATE,
      allowNull: true
    },
    customizacaofim: {
      type: DataTypes.DATE,
      allowNull: true
    },
    customizacaopausa: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    customizacaoresp: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      defaultValue: 0
    },
    coladeirainicio: {
      type: DataTypes.DATE,
      allowNull: true
    },
    coladeirafim: {
      type: DataTypes.DATE,
      allowNull: true
    },
    coladeirapausa: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    coladeiraresp: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      defaultValue: 0
    },
    usinageminicio: {
      type: DataTypes.DATE,
      allowNull: true
    },
    usinagemfim: {
      type: DataTypes.DATE,
      allowNull: true
    },
    usinagempausa: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    usinagemresp: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      defaultValue: 0
    },
    montageminicio: {
      type: DataTypes.DATE,
      allowNull: true
    },
    montagemfim: {
      type: DataTypes.DATE,
      allowNull: true
    },
    montagempausa: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    montagemresp: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      defaultValue: 0
    },
    paineisinicio: {
      type: DataTypes.DATE,
      allowNull: true
    },
    paineisfim: {
      type: DataTypes.DATE,
      allowNull: true
    },
    paineispausa: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    paineisresp: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      defaultValue: 0
    },
    embalageminicio: {
      type: DataTypes.DATE,
      allowNull: true
    },
    embalagemfim: {
      type: DataTypes.DATE,
      allowNull: true
    },
    embalagempausa: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    embalagemresp: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      defaultValue: 0
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    conferido: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      defaultValue: 0
    },
    motorista: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      defaultValue: 0
    },
    tamanho: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    separacao: {
      type: DataTypes.DATE,
      allowNull: true
    },
    acabamentoresp: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      defaultValue: 0
    },
    acabamentoinicio: {
      type: DataTypes.DATE,
      allowNull: true
    },
    acabamentofim: {
      type: DataTypes.DATE,
      allowNull: true
    },
    acabamentopausa: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tblProducao',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tblproducao_pkey",
        unique: true,
        fields: [
          { name: "ordemdecompra" },
        ]
      },
    ]
  });
};
