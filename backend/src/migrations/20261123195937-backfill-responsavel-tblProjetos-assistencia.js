'use strict';

// Mesma classe de bug do origem_cobrada: a tela "Nova Solicitação" guarda o
// nome de quem lançou em responsavel (texto, é o que a Capa imprime como
// "SOLICITANTE"), mas o service de salvar nunca mandava esse campo pro
// backend -- só o id_responsavel (FK) chegava. Corrigido no código (frontend
// manda o texto, backend grava). Aqui só o backfill: usa o login de
// tblUsuario pelo id_responsavel já salvo, que é o mesmo valor que teria
// sido gravado se o bug não existisse.
const OCS_AFETADAS = [
  2000013683, 2000013684, 2000013685, 2000013686, 2000013687, 2000013688,
  2000013689, 2000013690, 2000013691, 2000013692, 2000013697, 2000013698,
  2000013699, 2000013700, 2000013701, 2000013702, 2000013703, 2000013704,
  2000013705, 2000013706, 2000013707, 2000013708, 2000013709, 2000013710,
  2000013711, 2000013712, 2000013713,
];

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      `UPDATE "tblProjetos" p
       SET responsavel = u.login
       FROM "tblUsuario" u
       WHERE u.id = p.id_responsavel
         AND p.tipo_pedido = 'ASSISTENCIA'
         AND p.responsavel IS NULL
         AND p.ordemdecompra IN (:ocs);`,
      { replacements: { ocs: OCS_AFETADAS } },
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `UPDATE "tblProjetos"
       SET responsavel = NULL
       WHERE tipo_pedido = 'ASSISTENCIA'
         AND ordemdecompra IN (:ocs);`,
      { replacements: { ocs: OCS_AFETADAS } },
    );
  },
};
