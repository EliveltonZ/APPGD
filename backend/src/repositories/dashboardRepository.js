const { sequelize } = require('../client/db');
const { QueryTypes } = require('sequelize');
const { producaoStatus } = require('../utils/calcStatus');

async function getProjetosDash() {
  const rows = await sequelize.query(
    `SELECT
       p.ordemdecompra                   AS id,
       COALESCE(ta.name, '')             AS ambiente,
       COALESCE(v.name,  '')             AS vendedor,
       COALESCE(lb.name, '')             AS liberador,
       p.id_loja                         AS loja,
       l.name                            AS loja_nome,
       TO_CHAR(p.pronto, 'YYYY-MM-DD')   AS pronto
     FROM "tblProjetos"   p
     INNER JOIN "tblClientes"    c  ON c.id  = p.id_cliente
     INNER JOIN "tblLoja"        l  ON l.id  = p.id_loja
     LEFT  JOIN "tblTipoAmbiente" ta ON ta.id = p.id_tipoambiente
     LEFT  JOIN "tblVendedor"     v  ON v.id  = p.id_vendedor
     LEFT  JOIN "tblLiberador"    lb ON lb.id = p.id_liberador
     WHERE p.pronto IS NOT NULL`,
    { type: QueryTypes.SELECT }
  );
  return rows.map((r) => ({
    id:        Number(r.id),
    ambiente:  r.ambiente,
    vendedor:  r.vendedor,
    liberador: r.liberador,
    loja:      Number(r.loja),
    loja_nome: r.loja_nome ?? null,
    pronto:    r.pronto,
  }));
}

async function getProducaoDash() {
  const rows = await sequelize.query(
    `SELECT
       p.cliente,
       p.ambiente,
       p.parceado,
       p.pendencia,
       p.entrega,
       p.pronto,
       p.urgente,
       p.dataentrega,
       p.iniciado
     FROM "tblProjetos" p
     WHERE p.entrega IS NULL
       AND p.chegoufabrica IS NOT NULL
     ORDER BY p.dataentrega ASC NULLS LAST`,
    { type: QueryTypes.SELECT }
  );
  return rows.map((r) => ({
    cliente:  r.cliente  ?? '',
    ambiente: r.ambiente ?? '',
    status:   producaoStatus(r),
  }));
}

async function getProducaoDashDetalhada(start, end) {
  // 1. Esteira ao vivo: aguardando / iniciado / finalizado por etapa
  const [esteira] = await sequelize.query(
    `SELECT
       COUNT(*) FILTER (WHERE pd.corteinicio IS NULL)::int                                         AS corte_a,
       COUNT(*) FILTER (WHERE pd.corteinicio IS NOT NULL AND pd.cortefim IS NULL)::int              AS corte_i,
       COUNT(*) FILTER (WHERE pd.cortefim IS NOT NULL)::int                                        AS corte_f,

       COUNT(*) FILTER (WHERE pd.customizacaoinicio IS NULL)::int                                   AS customizacao_a,
       COUNT(*) FILTER (WHERE pd.customizacaoinicio IS NOT NULL AND pd.customizacaofim IS NULL)::int AS customizacao_i,
       COUNT(*) FILTER (WHERE pd.customizacaofim IS NOT NULL)::int                                  AS customizacao_f,

       COUNT(*) FILTER (WHERE pd.coladeirainicio IS NULL)::int                                      AS coladora_a,
       COUNT(*) FILTER (WHERE pd.coladeirainicio IS NOT NULL AND pd.coladeirafim IS NULL)::int       AS coladora_i,
       COUNT(*) FILTER (WHERE pd.coladeirafim IS NOT NULL)::int                                     AS coladora_f,

       COUNT(*) FILTER (WHERE pd.usinageminicio IS NULL)::int                                       AS usinagem_a,
       COUNT(*) FILTER (WHERE pd.usinageminicio IS NOT NULL AND pd.usinagemfim IS NULL)::int         AS usinagem_i,
       COUNT(*) FILTER (WHERE pd.usinagemfim IS NOT NULL)::int                                      AS usinagem_f,

       COUNT(*) FILTER (WHERE pd.montageminicio IS NULL)::int                                       AS montagem_a,
       COUNT(*) FILTER (WHERE pd.montageminicio IS NOT NULL AND pd.montagemfim IS NULL)::int         AS montagem_i,
       COUNT(*) FILTER (WHERE pd.montagemfim IS NOT NULL)::int                                      AS montagem_f,

       COUNT(*) FILTER (WHERE pd.paineisinicio IS NULL)::int                                        AS paineis_a,
       COUNT(*) FILTER (WHERE pd.paineisinicio IS NOT NULL AND pd.paineisfim IS NULL)::int           AS paineis_i,
       COUNT(*) FILTER (WHERE pd.paineisfim IS NOT NULL)::int                                       AS paineis_f,

       COUNT(*) FILTER (WHERE pd.embalageminicio IS NULL)::int                                      AS embalagem_a,
       COUNT(*) FILTER (WHERE pd.embalageminicio IS NOT NULL AND pd.embalagemfim IS NULL)::int       AS embalagem_i,
       COUNT(*) FILTER (WHERE pd.embalagemfim IS NOT NULL)::int                                     AS embalagem_f,

       COUNT(*) FILTER (WHERE pd.acabamentoinicio IS NULL)::int                                     AS acabamento_a,
       COUNT(*) FILTER (WHERE pd.acabamentoinicio IS NOT NULL AND pd.acabamentofim IS NULL)::int     AS acabamento_i,
       COUNT(*) FILTER (WHERE pd.acabamentofim IS NOT NULL)::int                                    AS acabamento_f
     FROM "tblProducao" pd
     INNER JOIN "tblProjetos" p ON p.ordemdecompra = pd.ordemdecompra
     WHERE p.iniciado IS NOT NULL AND p.pronto IS NULL`,
    { type: QueryTypes.SELECT },
  );

  // 2. Timestamps brutos por etapa — média calculada no frontend com calcWorkMinutes
  const etapaRows = await sequelize.query(
    `SELECT
       pd.corteinicio,        pd.cortefim,
       pd.customizacaoinicio, pd.customizacaofim,
       pd.coladeirainicio,    pd.coladeirafim,
       pd.usinageminicio,     pd.usinagemfim,
       pd.montageminicio,     pd.montagemfim,
       pd.paineisinicio,      pd.paineisfim,
       pd.embalageminicio,    pd.embalagemfim,
       pd.acabamentoinicio,   pd.acabamentofim
     FROM "tblProducao" pd
     INNER JOIN "tblProjetos" p ON p.ordemdecompra = pd.ordemdecompra
     WHERE pd.cortefim IS NOT NULL
       AND (:start IS NULL OR p.pronto >= :start::date)
       AND (:end   IS NULL OR p.pronto <= :end::date)`,
    { type: QueryTypes.SELECT, replacements: { start: start || null, end: end || null } },
  );

  // 3. Lead time produção por mês: chegoufabrica → pronto (dias)
  const leadTime = await sequelize.query(
    `SELECT
       TO_CHAR(pronto, 'YYYY-MM')          AS mes,
       ROUND(AVG(pronto - chegoufabrica))::int AS avg_dias,
       COUNT(*)::int                        AS total
     FROM "tblProjetos"
     WHERE pronto IS NOT NULL AND chegoufabrica IS NOT NULL
     GROUP BY mes ORDER BY mes`,
    { type: QueryTypes.SELECT },
  );

  // 4. No prazo vs atrasado por mês (pronto vs dataentrega)
  const onTime = await sequelize.query(
    `SELECT
       TO_CHAR(pronto, 'YYYY-MM')                                   AS mes,
       COUNT(*) FILTER (WHERE pronto <= dataentrega)::int            AS no_prazo,
       COUNT(*) FILTER (WHERE pronto  > dataentrega)::int            AS atrasado,
       COUNT(*)::int                                                 AS total
     FROM "tblProjetos"
     WHERE pronto IS NOT NULL AND dataentrega IS NOT NULL
     GROUP BY mes ORDER BY mes`,
    { type: QueryTypes.SELECT },
  );

  // 5. Status atual + urgentes (reusa producaoStatus)
  const prodRows = await sequelize.query(
    `SELECT
       p.parceado, p.pendencia, p.entrega, p.pronto,
       p.urgente, p.dataentrega, p.iniciado
     FROM "tblProjetos" p
     WHERE p.iniciado IS NOT NULL AND p.pronto IS NULL
     ORDER BY p.dataentrega ASC NULLS LAST`,
    { type: QueryTypes.SELECT },
  );

  const statusMap = {};
  let urgentesEmProd = 0;
  for (const r of prodRows) {
    const s = producaoStatus(r);
    statusMap[s] = (statusMap[s] ?? 0) + 1;
    if (r.urgente) urgentesEmProd++;
  }

  const ETAPA_KEYS   = ['corte','customizacao','coladora','usinagem','montagem','paineis','embalagem','acabamento'];
  const ETAPA_LABELS = ['Corte','Customização','Coladora','Usinagem','Montagem','Painéis','Embalagem','Acabamento'];

  return {
    totalEmProd:    prodRows.length,
    urgentesEmProd,
    statusDist: Object.entries(statusMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value),
    esteiraViva: ETAPA_KEYS.map((k, i) => ({
      name:       ETAPA_LABELS[i],
      aguardando: Number(esteira?.[`${k}_a`] ?? 0),
      iniciado:   Number(esteira?.[`${k}_i`] ?? 0),
      finalizado: Number(esteira?.[`${k}_f`] ?? 0),
    })),
    etapaRows,
    leadTimePorMes: leadTime.map(r => ({
      mes:     r.mes,
      avgDias: Number(r.avg_dias ?? 0),
      total:   Number(r.total    ?? 0),
    })),
    onTimePorMes: onTime.map(r => ({
      mes:      r.mes,
      noPrazo:  Number(r.no_prazo  ?? 0),
      atrasado: Number(r.atrasado  ?? 0),
      total:    Number(r.total     ?? 0),
    })),
  };
}

async function getParadasDash(start, end) {
  const s = start || '2020-01-01';
  const e = end   || new Date().toISOString().slice(0, 10);
  const rep = { start: s, end: e };

  const [porTipo, porMaquina, porMes, porMaquinaMes, [abertas]] = await Promise.all([
    sequelize.query(
      `SELECT t.descricao AS name,
              COUNT(*)::int AS value,
              ROUND(SUM(EXTRACT(EPOCH FROM (COALESCE(p.data_fim, NOW()) - p.data_inicio))/3600)::numeric, 1) AS horas
         FROM "tblParadas" p
         JOIN "tblTipoRequisicao" t ON t.id = p.id_tipo
        WHERE p.data_inicio >= :start AND p.data_inicio <= :end
        GROUP BY t.descricao
        ORDER BY value DESC`,
      { replacements: rep, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `SELECT m.nome AS name,
              COUNT(*)::int AS value,
              ROUND(SUM(EXTRACT(EPOCH FROM (COALESCE(p.data_fim, NOW()) - p.data_inicio))/3600)::numeric, 1) AS horas
         FROM "tblParadas" p
         JOIN "tblMaquinas" m ON m.id = p.id_maquina
        WHERE p.data_inicio >= :start AND p.data_inicio <= :end
        GROUP BY m.nome
        ORDER BY value DESC`,
      { replacements: rep, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `SELECT TO_CHAR(data_inicio, 'YYYY-MM') AS mes,
              COUNT(*)::int AS total,
              ROUND(SUM(EXTRACT(EPOCH FROM (COALESCE(data_fim, NOW()) - data_inicio))/3600)::numeric, 1) AS horas
         FROM "tblParadas"
        WHERE data_inicio >= :start AND data_inicio <= :end
        GROUP BY mes
        ORDER BY mes`,
      { replacements: rep, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `SELECT TO_CHAR(p.data_inicio, 'YYYY-MM') AS mes,
              m.nome AS maquina,
              ROUND(SUM(EXTRACT(EPOCH FROM (COALESCE(p.data_fim, NOW()) - p.data_inicio))/3600)::numeric, 1) AS horas
         FROM "tblParadas" p
         JOIN "tblMaquinas" m ON m.id = p.id_maquina
        WHERE p.data_inicio >= :start AND p.data_inicio <= :end
        GROUP BY mes, m.nome
        ORDER BY mes`,
      { replacements: rep, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `SELECT COUNT(*)::int AS total FROM "tblParadas" WHERE data_fim IS NULL`,
      { type: QueryTypes.SELECT },
    ),
  ]);

  return {
    totalParadas:    porTipo.reduce((s, r) => s + Number(r.value), 0),
    tempoTotalHoras: Math.round(porMaquina.reduce((s, r) => s + Number(r.horas), 0) * 10) / 10,
    totalAbertas:    Number(abertas?.total ?? 0),
    porTipo:       porTipo.map(r => ({ name: r.name, value: Number(r.value), horas: Number(r.horas) })),
    porMaquina:    porMaquina.map(r => ({ name: r.name, value: Number(r.value), horas: Number(r.horas) })),
    porMes:        porMes.map(r => ({ mes: r.mes, total: Number(r.total), horas: Number(r.horas) })),
    porMaquinaMes: porMaquinaMes.map(r => ({ mes: r.mes, maquina: r.maquina, horas: Number(r.horas) })),
  };
}

module.exports = { getProjetosDash, getProducaoDash, getProducaoDashDetalhada, getParadasDash };
