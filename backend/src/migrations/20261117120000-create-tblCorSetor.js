'use strict';

// Cor de faixa usada na impressão de crachás, por setor. Tabela livre (sem
// enum/lista fixa de setores) porque novos setores podem aparecer a
// qualquer momento — qualquer string de setor pode ganhar uma linha aqui.
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tblCorSetor', {
      setor: {
        type: Sequelize.TEXT,
        allowNull: false,
        primaryKey: true,
      },
      cor: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      atualizado_em: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tblCorSetor');
  },
};
