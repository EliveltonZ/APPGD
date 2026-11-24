'use strict';

// Pedido explicito: revogar o acesso de toda a equipe (exceto os donos do
// sistema) nas 3 areas Compras, Fabrica e Almoxarifado. Escopo das colunas
// definido pelos grupos de menu 'compras', 'fabrica' e 'almoxarifado' em
// frontend/src/config/appRoutes.ts -- nao inclui Logistica (status,
// planejamento) nem Cadastros (cadastros_fornecedores), que sao grupos
// separados, mesmo compartilhando parte do dominio.
const COLUNAS = [
  // Compras
  'compras', 'pendencia', 'compras_liberacoes', 'compras_necessidades',
  'compras_confirmar', 'compras_pedidos', 'compras_lancamento_acessorios',
  // Fabrica (PCP/Producao)
  'pcp', 'producao', 'apontamento', 'expedicao', 'relatorios',
  'paradas_maquina', 'paradas_admin', 'estoque_reservar',
  'fabrica_solicitacao_interna',
  // Almoxarifado
  'almoxarifado_estoque', 'almoxarifado_baixas', 'almoxarifado_nota_fiscal',
  'almoxarifado_transferencias', 'almoxarifado_ajuste', 'almoxarifado_vinculos',
];

// Contas excluidas da revogacao: ADMINISTRADOR (-1), ELIVELTON (1) e
// MATHEUS (2) -- donos/dev do sistema, nao "equipe".
const IDS_EXCLUIDOS = [-1, 1, 2];

module.exports = {
  async up(queryInterface) {
    const sets = COLUNAS.map((c) => `"${c}" = false`).join(', ');
    await queryInterface.sequelize.query(
      `UPDATE "tblUsuario" SET ${sets} WHERE id NOT IN (:ids);`,
      { replacements: { ids: IDS_EXCLUIDOS } },
    );
  },

  // Irreversivel -- nao guardamos o valor anterior de cada permissao por
  // usuario. Se precisar devolver acesso a alguem, reconceder manualmente
  // pela tela Configuracoes > Acessos.
  async down() {},
};
