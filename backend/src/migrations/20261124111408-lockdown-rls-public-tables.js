'use strict';

// Item 1/3/7 de docs/seguranca-pendencias.md: a chave `anon` do Supabase
// (vazada, mas ainda valida) le e escreve em qualquer tabela abaixo pela
// API publica (PostgREST). O backend conecta direto via DATABASE_URL como
// `postgres`, que tem BYPASSRLS -- essa trava nao afeta o sistema em uso.
//
// Dois grupos de tabela:
// - TABELAS_COM_POLICY_ABERTA: ja tem RLS habilitado, mas uma policy
//   "all-select-policy" (FOR ALL TO public USING (true)) libera tudo mesmo
//   assim. Remover a policy, com RLS ja ligado, volta pro padrao
//   "nega tudo" pra quem nao tem BYPASSRLS (anon/authenticated).
// - TABELAS_SEM_RLS: tabelas novas (modulo compras/almoxarifado + 1 antiga,
//   tblCorSetor) criadas sem ENABLE ROW LEVEL SECURITY -- corrige o
//   descumprimento da regra da skill /migration.
const TABELAS_COM_POLICY_ABERTA = [
  'tblOcorrencia', 'tblLoja', 'tblEtapa', 'tblProducao', 'tblPreferencias',
  'tblDatas', 'tblAvulsos', 'tblAcessorios', 'tblConfig', 'tblAssistencias',
  'tblVendedor', 'tblTipoCliente', 'tblFalhas', 'tblCausa', 'tblEquipSat',
  'tblLiberador', 'tblTipoAmbiente', 'tblCausaFalha', 'tblCategorias',
  'tblTipoAssistencia', 'tblClientes', 'tblTipoContrato', 'tblPecas',
  'tblCentrosCusto', 'tblPlanoContas', 'tblFornecedores', 'tblMontador',
  'tblProjetos', 'tblUsuario',
];

const TABELAS_SEM_RLS = [
  'tblCorSetor', 'tblEstoqueMovimentos', 'tblKioskPin', 'tblLocalizacoes',
  'tblMateriais', 'tblMateriaisCodigoNF', 'tblMateriaisReferenciaPromob',
  'tblNotasFiscais', 'tblNotasFiscaisItens', 'tblSolicitacaoCompras',
  'tblSolicitacaoComprasItens', 'tblSolicitacaoInterna', 'tblTransferencias',
  'tblXmlConsumo', 'tblXmlImportacoes',
];

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      for (const table of TABELAS_COM_POLICY_ABERTA) {
        await queryInterface.sequelize.query(
          `DROP POLICY IF EXISTS "all-select-policy" ON "${table}";`,
          { transaction: t },
        );
      }
      for (const table of TABELAS_SEM_RLS) {
        await queryInterface.sequelize.query(
          `ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`,
          { transaction: t },
        );
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      for (const table of TABELAS_SEM_RLS) {
        await queryInterface.sequelize.query(
          `ALTER TABLE "${table}" DISABLE ROW LEVEL SECURITY;`,
          { transaction: t },
        );
      }
      for (const table of TABELAS_COM_POLICY_ABERTA) {
        await queryInterface.sequelize.query(
          `CREATE POLICY "all-select-policy" ON "${table}" FOR ALL TO public USING (true);`,
          { transaction: t },
        );
      }
    });
  },
};
