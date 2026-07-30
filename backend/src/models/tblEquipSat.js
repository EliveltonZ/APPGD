const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblEquipSat', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.SMALLINT,
      allowNull: false,
      primaryKey: true
    },
    idSat: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'id_sat'
    },
    idMontador: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      field: 'id_montador'
    }
  }, {
    sequelize,
    tableName: 'tblEquipSat',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tblEquipSat_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
