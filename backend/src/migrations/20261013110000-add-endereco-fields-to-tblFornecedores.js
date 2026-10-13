'use strict';
const { DataTypes } = require('sequelize');

// Colunas vindas da planilha legada tbl_Fornecedores.xlsx (281 fornecedores
// já cadastrados em outro sistema) — endereço completo + inscrição estadual,
// que o cadastro atual (nome/cnpj/contato/ativo) não tinha.
module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn('tblFornecedores', 'inscricao_estadual', { type: DataTypes.TEXT, allowNull: true });
    await queryInterface.addColumn('tblFornecedores', 'endereco', { type: DataTypes.TEXT, allowNull: true });
    await queryInterface.addColumn('tblFornecedores', 'numero', { type: DataTypes.TEXT, allowNull: true });
    await queryInterface.addColumn('tblFornecedores', 'bairro', { type: DataTypes.TEXT, allowNull: true });
    await queryInterface.addColumn('tblFornecedores', 'cidade', { type: DataTypes.TEXT, allowNull: true });
    await queryInterface.addColumn('tblFornecedores', 'cep', { type: DataTypes.TEXT, allowNull: true });
    await queryInterface.addColumn('tblFornecedores', 'estado', { type: DataTypes.STRING(2), allowNull: true });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('tblFornecedores', 'inscricao_estadual');
    await queryInterface.removeColumn('tblFornecedores', 'endereco');
    await queryInterface.removeColumn('tblFornecedores', 'numero');
    await queryInterface.removeColumn('tblFornecedores', 'bairro');
    await queryInterface.removeColumn('tblFornecedores', 'cidade');
    await queryInterface.removeColumn('tblFornecedores', 'cep');
    await queryInterface.removeColumn('tblFornecedores', 'estado');
  },
};
