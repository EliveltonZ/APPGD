const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblCausa', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.SMALLINT,
      allowNull: false,
      primaryKey: true
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'tblCausa',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tblCausa_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
