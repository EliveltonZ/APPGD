const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblFalhas', {
    codigo: {
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
    tableName: 'tblFalhas',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tblFalhas_pkey",
        unique: true,
        fields: [
          { name: "codigo" },
        ]
      },
    ]
  });
};
