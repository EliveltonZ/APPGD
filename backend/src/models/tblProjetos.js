const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "tblProjetos",
    {
      ordemdecompra: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
      },
      codcc: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      cliente: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      contrato: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      numproj: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      ambiente: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      tipoambiente: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      chegoufabrica: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      dataentrega: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      lote: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      iniciado: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      pronto: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      entrega: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      volumes: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        defaultValue: 0,
      },
      tipo: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      tipocontrato: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      vendedor: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      liberador: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      loja: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      tipocliente: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      datacontrato: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      dataassinatura: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      valorbruto: {
        type: DataTypes.REAL,
        allowNull: true,
        defaultValue: 0,
      },
      valornegociado: {
        type: DataTypes.REAL,
        allowNull: true,
        defaultValue: 0,
      },
      customaterial: {
        type: DataTypes.REAL,
        allowNull: true,
        defaultValue: 0,
      },
      customaterialadicional: {
        type: DataTypes.REAL,
        allowNull: true,
        defaultValue: 0,
      },
      area: {
        type: DataTypes.REAL,
        allowNull: true,
        defaultValue: 0,
      },
      pecas: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        defaultValue: 0,
        field: "peças",
      },
      previsao: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      pendencia: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      urgente: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      etapa: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      pedido: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        defaultValue: 0,
      },
      parceado: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      idCliente: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "id_cliente",
      },
      idTipoambiente: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        field: "id_tipoambiente",
      },
      idVendedor: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        field: "id_vendedor",
      },
      idLiberador: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        field: "id_liberador",
      },
      idLoja: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        field: "id_loja",
      },
      idTipocontrato: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        field: "id_tipocontrato",
      },
      idTipocliente: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        field: "id_tipocliente",
      },
      idEtapa: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        field: "id_etapa",
      },
    },
    {
      sequelize,
      tableName: "tblProjetos",
      schema: "public",
      timestamps: false,
      indexes: [
        {
          name: "tblprojetos_pkey",
          unique: true,
          fields: [{ name: "ordemdecompra" }],
        },
        {
          name: "unique_pedido_nao_zero",
          unique: true,
          fields: [{ name: "pedido" }],
        },
      ],
    },
  );
};
