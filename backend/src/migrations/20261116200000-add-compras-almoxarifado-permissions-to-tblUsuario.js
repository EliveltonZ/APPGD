'use strict';

// Telas novas de Compras/Almoxarifado (pipeline de reserva de chapa) que
// até agora ficavam liberadas pra qualquer usuário logado, sem coluna real
// de permissão — ver comentários removidos em estoque.js/notaFiscal.js/
// solicitacaoCompras.js/solicitacaoInterna.js e no placeholder de
// services/usuarios.ts (toAuthUser).
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      const table = 'tblUsuario';
      const columns = [
        'compras_liberacoes',
        'compras_necessidades',
        'compras_confirmar',
        'compras_pedidos',
        'almoxarifado_estoque',
        'almoxarifado_baixas',
        'almoxarifado_nota_fiscal',
        'almoxarifado_ajuste',
        'almoxarifado_vinculos',
      ];
      for (const col of columns) {
        await queryInterface.addColumn(
          table,
          col,
          { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false },
          { transaction: t },
        );
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      const table = 'tblUsuario';
      const columns = [
        'compras_liberacoes',
        'compras_necessidades',
        'compras_confirmar',
        'compras_pedidos',
        'almoxarifado_estoque',
        'almoxarifado_baixas',
        'almoxarifado_nota_fiscal',
        'almoxarifado_ajuste',
        'almoxarifado_vinculos',
      ];
      for (const col of columns) {
        await queryInterface.removeColumn(table, col, { transaction: t });
      }
    });
  },
};
