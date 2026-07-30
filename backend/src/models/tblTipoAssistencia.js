const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblTipoAssistencia', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.SMALLINT,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'tblTipoAssistencia',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tblTipoAssistencia_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
