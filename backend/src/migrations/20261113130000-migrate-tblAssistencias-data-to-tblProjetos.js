'use strict';

// Migração de dados (não reversível de forma simétrica): copia toda linha
// histórica de tblAssistencias pra tblProjetos (tipo_pedido='ASSISTENCIA'),
// gerando uma OC nova pra cada uma via seq_assistencia_oc (mesma sequence
// que o fluxo de criação "Nova Solicitação" já usa), e remapeia as peças
// (tblPecas.id_assistencia) e a equipe (tblEquipSat.id_sat) — que hoje
// guardam o "solicitacao" antigo (ex.: "AS-2025-001") — pra guardarem a nova
// OC numérica, igual o fluxo novo já faz.
//
// tblAssistencias NÃO é apagada aqui — fica congelada como backup histórico.

module.exports = {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize;
    await sequelize.transaction(async (t) => {
      // 1) mapeia cada solicitação antiga pra uma OC nova
      await sequelize.query(`
        CREATE TEMPORARY TABLE _migracao_assistencia_oc ON COMMIT DROP AS
        SELECT solicitacao, NEXTVAL('seq_assistencia_oc') AS nova_oc
        FROM "tblAssistencias";
      `, { transaction: t });

      // 2) migra as linhas pra tblProjetos
      await sequelize.query(`
        INSERT INTO "tblProjetos" (
          ordemdecompra, tipo_pedido, contrato, cliente, ambiente,
          data_criacao, iniciado, previsao, pronto, dataentrega,
          responsavel, montador, conferente, urgente, liberacao,
          observacoes, observacoes2, sem_material, impresso,
          origem_montagem, producao, escritorio, origem_promob, origem_entrega,
          data_agendamento, bairro, tempo, destino, finalizada,
          prazo_fabrica, prazo_logistica, supervisor, pedido_assistencia,
          origem_cobrada, tipo_solicitacao, pendencia, numero_solicitacao,
          lote, valorbruto, valornegociado, customaterial, customaterialadicional
        )
        SELECT
          m.nova_oc, 'ASSISTENCIA', a.contrato, a.cliente, a.ambiente,
          a.datasolicitacao::date, a.iniciado, a.previsao, a.pronto, a.dataentrega,
          COALESCE(a.responsavel, a.solicitante), a.montador, a.conferente,
          (UPPER(COALESCE(a.urgente, '')) = 'SIM'), a.liberacao,
          a.observacoes2, a.observacoes, a.sem_material, a.impresso,
          a.montagem, a.producao, a.escritorio, a.promob, a.entrega,
          a.dataagendamento, a.bairro, a.tempo, a.destino, a.finalizada,
          a.prazof, a.prazol, a.supervisor, a.pedido,
          a.cobrada, a.tipoassistencia, a.pendencia, a.solicitacao,
          a.corte, 0, 0, 0, 0
        FROM "tblAssistencias" a
        JOIN _migracao_assistencia_oc m ON m.solicitacao = a.solicitacao;
      `, { transaction: t });

      // 3) remapeia peças e equipe pra apontarem pra OC nova
      await sequelize.query(`
        UPDATE "tblPecas" p
        SET id_assistencia = m.nova_oc::text
        FROM _migracao_assistencia_oc m
        WHERE p.id_assistencia = m.solicitacao;
      `, { transaction: t });

      await sequelize.query(`
        UPDATE "tblEquipSat" e
        SET id_sat = m.nova_oc::text
        FROM _migracao_assistencia_oc m
        WHERE e.id_sat = m.solicitacao;
      `, { transaction: t });
    });
  },

  async down(queryInterface) {
    // Reverso: remove só as linhas migradas (identificáveis por
    // numero_solicitacao bater com um solicitacao real de tblAssistencias) e
    // devolve id_assistencia/id_sat pro valor antigo. Não recupera a
    // sequence consumida (nextval não é reversível), o que é inofensivo —
    // a sequence só precisa nunca repetir número, nunca precisa ser densa.
    const sequelize = queryInterface.sequelize;
    await sequelize.transaction(async (t) => {
      await sequelize.query(`
        UPDATE "tblPecas" p
        SET id_assistencia = a.solicitacao
        FROM "tblProjetos" proj
        JOIN "tblAssistencias" a ON a.solicitacao = proj.numero_solicitacao
        WHERE proj.tipo_pedido = 'ASSISTENCIA'
          AND p.id_assistencia = proj.ordemdecompra::text;
      `, { transaction: t });

      await sequelize.query(`
        UPDATE "tblEquipSat" e
        SET id_sat = a.solicitacao
        FROM "tblProjetos" proj
        JOIN "tblAssistencias" a ON a.solicitacao = proj.numero_solicitacao
        WHERE proj.tipo_pedido = 'ASSISTENCIA'
          AND e.id_sat = proj.ordemdecompra::text;
      `, { transaction: t });

      await sequelize.query(`
        DELETE FROM "tblProjetos" proj
        USING "tblAssistencias" a
        WHERE proj.tipo_pedido = 'ASSISTENCIA'
          AND a.solicitacao = proj.numero_solicitacao;
      `, { transaction: t });
    });
  },
};
