const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblAvulsos', {
    ordemdecompra: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'tblProjetos',
        key: 'ordemdecompra'
      }
    },
    avulso: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    paineis: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    portaaluminio: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    vidros: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    pecaspintadas: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    tapecaria: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    serralheria: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    cabide: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    trilho: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    volmod: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    avulsol: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    paineisl: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    portaaluminiol: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    vidrosl: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    pecaspintadasl: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tapecarial: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    serralherial: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cabidel: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    trilhol: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    modulosl: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    avulsoq: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      defaultValue: 0
    },
    paineisq: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      defaultValue: 0
    },
    portaaluminioq: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      defaultValue: 0
    },
    vidrosq: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      defaultValue: 0
    },
    pecaspintadasq: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      defaultValue: 0
    },
    tapecariaq: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      defaultValue: 0
    },
    serralheriaq: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      defaultValue: 0
    },
    cabideq: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      defaultValue: 0
    },
    trilhoq: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      defaultValue: 0
    },
    modulosq: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      defaultValue: 0
    },
    totalvolumes: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'tblAvulsos',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tblavulsos_pkey",
        unique: true,
        fields: [
          { name: "ordemdecompra" },
        ]
      },
    ]
  });
};
