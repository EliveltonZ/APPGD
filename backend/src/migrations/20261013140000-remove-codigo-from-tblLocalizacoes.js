'use strict';
const { DataTypes } = require('sequelize');

// "codigo" ficou redundante assim que rua/prateleira/nivel/divisao passaram
// a existir — o endereço (01-01-03-D) já é montado em memória a partir dos
// 4 campos (ver localizacoesRepository.js), e a própria id já identifica a
// linha. Coluna removida diretamente no banco pelo usuário antes desta
// migration existir — down() redefinido como `IF EXISTS` pra up() ficar
// seguro de rodar em qualquer ambiente, já tenha sido removida à mão ou não.
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query('ALTER TABLE "tblLocalizacoes" DROP COLUMN IF EXISTS codigo');
  },

  async down(queryInterface) {
    await queryInterface.addColumn('tblLocalizacoes', 'codigo', {
      type: DataTypes.STRING(30),
      allowNull: true,
    });
  },
};
