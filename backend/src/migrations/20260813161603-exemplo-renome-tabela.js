'use strict';

// EXEMPLO — delete este arquivo antes de usar migrations de verdade.
//
// Para criar uma migration real:
//   npm run migration:create -- nome-descritivo
//
// Para aplicar:
//   npm run migrate
//
// Para reverter a última:
//   npm run migrate:undo

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Renomear tabela:
    // await queryInterface.renameTable('tblProjetos', 'projetos');

    // Renomear coluna:
    // await queryInterface.renameColumn('projetos', 'ordemdecompra', 'id');

    // Adicionar coluna:
    // await queryInterface.addColumn('tblProjetos', 'tipo_projeto', {
    //   type:         require('sequelize').DataTypes.STRING(20),
    //   allowNull:    true,
    //   defaultValue: 'padrao',
    // });

    // Remover coluna:
    // await queryInterface.removeColumn('tblProjetos', 'coluna_antiga');
  },

  async down(queryInterface) {
    // Reverso exato do up — ex: se up fez renameTable('tblProjetos','projetos'),
    // o down faz renameTable('projetos','tblProjetos').
  },
};
