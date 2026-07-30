const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblMaquinas', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  }, {
    sequelize,
    tableName: 'tblMaquinas',
    schema: 'public',
    timestamps: false,
  });
};
