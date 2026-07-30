const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblTipoRequisicao', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    descricao: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  }, {
    sequelize,
    tableName: 'tblTipoRequisicao',
    schema: 'public',
    timestamps: false,
  });
};
