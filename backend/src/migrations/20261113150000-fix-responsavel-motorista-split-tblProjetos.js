'use strict';

// Correção da migration 20261113130000: na primeira passada, `responsavel`
// foi preenchido com COALESCE(tblAssistencias.responsavel, solicitante),
// misturando dois papéis diferentes num só campo. O correto (pra bater com
// o que Produção/Logística já leem e escrevem via /assistencias/):
//   responsavel (tblProjetos, mesma coluna usada por todo Projeto = "quem
//     lançou")           <- tblAssistencias.solicitante
//   motorista (coluna nova)  <- tblAssistencias.responsavel
// tblAssistencias continua intacta, então é possível reler a fonte original
// e corrigir sem perder nada.
module.exports = {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize;
    await sequelize.transaction(async (t) => {
      await sequelize.query(`
        UPDATE "tblProjetos" proj
        SET motorista = a.responsavel,
            responsavel = a.solicitante
        FROM "tblAssistencias" a
        WHERE proj.tipo_pedido = 'ASSISTENCIA'
          AND proj.numero_solicitacao = a.solicitacao;
      `, { transaction: t });
    });
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize;
    await sequelize.transaction(async (t) => {
      await sequelize.query(`
        UPDATE "tblProjetos" proj
        SET responsavel = COALESCE(a.responsavel, a.solicitante),
            motorista = NULL
        FROM "tblAssistencias" a
        WHERE proj.tipo_pedido = 'ASSISTENCIA'
          AND proj.numero_solicitacao = a.solicitacao;
      `, { transaction: t });
    });
  },
};
