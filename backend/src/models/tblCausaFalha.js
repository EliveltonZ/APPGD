const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblCausaFalha', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    idFalha: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      field: 'id_falha'
    },
    idCausa: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      field: 'id_causa'
    }
  }, {
    sequelize,
    tableName: 'tblCausaFalha',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tblCausaFalha_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
