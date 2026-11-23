'use strict';

// Bug no frontend (services/project.ts) gravava `null` em origem_cobrada
// sempre que a assistência era cadastrada como "não cobrada" (o caso comum),
// em vez de `false` — por isso essas peças nunca apareciam na lista de
// Qualidade (que filtra `origem_cobrada = false`; `NULL = false` não bate).
// Essa lista abaixo são as 24 assistências afetadas: tudo que veio depois da
// última assistência que já estava correta (OC 2000013681) e ficou com
// origem_cobrada NULL em vez de false. Não inclui a OC 2000013704, que já
// está correta como `true` (cobrada de verdade).
const OCS_AFETADAS = [
  2000013683, 2000013684, 2000013685, 2000013686, 2000013687, 2000013688,
  2000013689, 2000013690, 2000013691, 2000013692, 2000013697, 2000013698,
  2000013699, 2000013700, 2000013701, 2000013702, 2000013703, 2000013705,
  2000013706, 2000013707, 2000013708, 2000013709, 2000013710, 2000013711,
];

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      // Corrige o dado já gravado errado (o fix no código impede novos casos,
      // mas não afeta o que já está no banco).
      await queryInterface.sequelize.query(
        `UPDATE "tblProjetos"
         SET origem_cobrada = false
         WHERE tipo_pedido = 'ASSISTENCIA'
           AND origem_cobrada IS NULL
           AND ordemdecompra IN (:ocs);`,
        { replacements: { ocs: OCS_AFETADAS }, transaction: t },
      );

      // Default false na coluna: se algum fluxo futuro deixar de enviar o
      // campo (em vez de mandar null explícito), o banco já resolve sozinho.
      await queryInterface.sequelize.query(
        `ALTER TABLE "tblProjetos" ALTER COLUMN origem_cobrada SET DEFAULT false;`,
        { transaction: t },
      );

      // Trava NULL só pra assistência (pedido normal não usa esse campo e
      // tem milhares de linhas com ele NULL de propósito — não pode virar
      // NOT NULL pra tabela inteira). CHECK em vez de NOT NULL de coluna.
      await queryInterface.sequelize.query(
        `ALTER TABLE "tblProjetos"
         ADD CONSTRAINT origem_cobrada_assistencia_not_null_chk
         CHECK (tipo_pedido <> 'ASSISTENCIA' OR origem_cobrada IS NOT NULL);`,
        { transaction: t },
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.sequelize.query(
        `ALTER TABLE "tblProjetos" DROP CONSTRAINT IF EXISTS origem_cobrada_assistencia_not_null_chk;`,
        { transaction: t },
      );

      await queryInterface.sequelize.query(
        `ALTER TABLE "tblProjetos" ALTER COLUMN origem_cobrada DROP DEFAULT;`,
        { transaction: t },
      );

      await queryInterface.sequelize.query(
        `UPDATE "tblProjetos"
         SET origem_cobrada = NULL
         WHERE tipo_pedido = 'ASSISTENCIA'
           AND ordemdecompra IN (:ocs);`,
        { replacements: { ocs: OCS_AFETADAS }, transaction: t },
      );
    });
  },
};
