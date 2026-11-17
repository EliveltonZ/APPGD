'use strict';

// Cria as colunas de permissão pra "Validar XML" (estoque_reservar),
// "Lançamento Acessórios" (compras_lancamento_acessorios) e "Solicitação
// Interna" (fabrica_solicitacao_interna) — só o dado no banco, sem mexer em
// model/rotas/frontend ainda (ficam false pra todo mundo via defaultValue).
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      const table = 'tblUsuario';
      const columns = [
        'estoque_reservar',
        'compras_lancamento_acessorios',
        'fabrica_solicitacao_interna',
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
        'estoque_reservar',
        'compras_lancamento_acessorios',
        'fabrica_solicitacao_interna',
      ];
      for (const col of columns) {
        await queryInterface.removeColumn(table, col, { transaction: t });
      }
    });
  },
};
