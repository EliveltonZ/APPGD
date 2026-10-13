'use strict';
const { DataTypes } = require('sequelize');

// Endereçamento estruturado (Rua-Prateleira-Nível-Divisão, ex: 01-01-03-D)
// em vez de um "codigo" inteiramente livre — permite filtrar/consultar por
// qualquer nível e evita erro de digitação do código composto. `codigo`
// continua existindo (todo o resto do app já usa pra exibir/selecionar),
// mas passa a ser gerado automaticamente a partir dos 4 campos.
// Tabela vazia no momento da migration — sem necessidade de backfill.
module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn('tblLocalizacoes', 'rua', { type: DataTypes.STRING(10), allowNull: false });
    await queryInterface.addColumn('tblLocalizacoes', 'prateleira', { type: DataTypes.STRING(10), allowNull: false });
    await queryInterface.addColumn('tblLocalizacoes', 'nivel', { type: DataTypes.STRING(10), allowNull: false });
    await queryInterface.addColumn('tblLocalizacoes', 'divisao', { type: DataTypes.STRING(10), allowNull: false });

    await queryInterface.addIndex('tblLocalizacoes', ['rua', 'prateleira', 'nivel', 'divisao'], {
      unique: true,
      name: 'tblLocalizacoes_endereco_uq',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('tblLocalizacoes', 'tblLocalizacoes_endereco_uq');
    await queryInterface.removeColumn('tblLocalizacoes', 'rua');
    await queryInterface.removeColumn('tblLocalizacoes', 'prateleira');
    await queryInterface.removeColumn('tblLocalizacoes', 'nivel');
    await queryInterface.removeColumn('tblLocalizacoes', 'divisao');
  },
};
