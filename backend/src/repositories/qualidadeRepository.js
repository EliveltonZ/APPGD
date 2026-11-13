const { Pecas, sequelize } = require('../client/db');

// Pecas.id_assistencia guarda a OC (como texto) da linha de tblProjetos que
// criou a peça — tanto de Projeto quanto de Assistência. Aqui só interessa
// Assistência, então faz a junção direto em SQL (evita depender de uma
// associação Sequelize comparando TEXT com BIGINT) e já filtra
// tipo_pedido='ASSISTENCIA' + não cobrada.
async function listarPecasQualidade() {
  const rows = await sequelize.query(`
    SELECT
      p.codigo        AS id,
      proj.pedido_assistencia AS pedido,
      p.id_erp        AS "idErp",
      p.id_assistencia AS "idAssistencia",
      p.qtd, p.cor, p.peca, p.dimensoes,
      p.lado          AS orientacao,
      proj.cliente, proj.ambiente,
      p.id_ocorrencia AS "idOcorrencia",
      p.id_falha      AS "idFalha",
      p.id_causa      AS "idCausa",
      proj.origem_cobrada AS cobrada,
      p.observacoes,
      proj.supervisor,
      p.analise
    FROM "tblPecas" p
    JOIN "tblProjetos" proj
      ON proj.tipo_pedido = 'ASSISTENCIA'
      AND p.id_assistencia ~ '^[0-9]+$'
      AND p.id_assistencia::bigint = proj.ordemdecompra
    WHERE (p.id_causa IS NULL OR p.id_causa = 0)
      AND proj.origem_cobrada = false
    ORDER BY p.codigo ASC;
  `, { type: sequelize.QueryTypes.SELECT });

  return rows.map(pk => ({
    id:             pk.id,
    pedido:         pk.pedido,
    id_erp:         pk.idErp,
    id_assistencia: pk.idAssistencia,
    qtd:            pk.qtd,
    cor:            pk.cor,
    peca:           pk.peca,
    dimensoes:      pk.dimensoes,
    orientacao:     pk.orientacao,
    cliente:        pk.cliente,
    ambiente:       pk.ambiente,
    ocorrencia:     pk.idOcorrencia,
    falha:          pk.idFalha,
    causa:          pk.idCausa,
    cobrada:        pk.cobrada,
    observacoes:    pk.observacoes,
    supervisor:     pk.supervisor,
    analise:        pk.analise,
  }));
}

async function updateCausaRaiz({ id, id_erp, falha, causa, analise }) {
  await Pecas.update(
    {
      idFalha: falha  != null ? Number(falha)  : null,
      idCausa: causa  != null ? Number(causa)  : null,
      analise: analise ?? null,
      idErp:   id_erp != null ? Number(id_erp) : null,
    },
    { where: { codigo: Number(id) } },
  );
}

module.exports = { listarPecasQualidade, updateCausaRaiz };
