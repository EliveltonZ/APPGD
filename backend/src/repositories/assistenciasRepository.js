const { Op, literal } = require("sequelize");
const {
  sequelize,
  Assistencias,
  Projetos,
  Liberador,
  EquipSat,
  Pecas,
} = require("../client/db");
const { assistenciaStatus, diasRestantes } = require("../utils/calcStatus");

async function listarAssistencias(p_data) {
  const rows = await Assistencias.findAll({
    where: { datasolicitacao: { [Op.gte]: p_data } },
    attributes: [
      "solicitacao",
      "corte",
      "contrato",
      "cliente",
      "ambiente",
      "datasolicitacao",
      "prazof",
      "iniciado",
      "previsao",
      "pronto",
      "dataentrega",
      "urgente",
      "pendencia",
      "semMaterial",
      "producao",
      "escritorio",
    ],
    order: [
      [literal("CASE WHEN dataentrega IS NOT NULL THEN 2 WHEN pronto IS NOT NULL THEN 1 ELSE 0 END"), "ASC"],
      [literal("CASE WHEN LOWER(COALESCE(urgente, '')) = 'sim' THEN 0 ELSE 1 END"), "ASC"],
      ["datasolicitacao", "DESC"],
    ],
  });
  return rows.map((a) => ({
    solicitacao:     a.solicitacao,
    corte:           a.corte,
    contrato:        a.contrato,
    cliente:         a.cliente,
    ambiente:        a.ambiente,
    datasolicitacao: a.datasolicitacao,
    prazo:           a.prazof ? diasRestantes(a.prazof) : null,
    status:          assistenciaStatus(a),
    iniciado:        a.iniciado,
    previsao:        a.previsao,
    pronto:          a.pronto,
    dataentrega:     a.dataentrega,
    urgente:         a.urgente,
  }));
}

async function buscarAssistencia(p_solicitacao) {
  const a = await Assistencias.findOne({
    where: { solicitacao: p_solicitacao },
  });
  if (!a) return [];

  let liberadorName = null;
  if (a.contrato) {
    const projeto = await Projetos.findOne({
      where: { contrato: a.contrato },
      attributes: ["idLiberador"],
    });
    if (projeto?.idLiberador) {
      const lib = await Liberador.findByPk(projeto.idLiberador, {
        attributes: ["name"],
      });
      liberadorName = lib?.name ?? null;
    }
  }

  return [
    {
      solicitacao:     a.solicitacao,
      contrato:        a.contrato,
      solicitante:     a.solicitante,
      datasolicitacao: a.datasolicitacao,
      previsao:        a.previsao,
      cliente:         a.cliente,
      pedido:          a.pedido,
      corte:           a.corte,
      ambiente:        a.ambiente,
      situacao:        assistenciaStatus(a),
      urgente:         a.urgente,
      observacao:      a.observacoes,
      observacao2:     a.observacoes2,
      iniciado:        a.iniciado,
      pronto:          a.pronto,
      conferente:      a.conferente,
      liberacao:       a.liberacao,
      liberador:       liberadorName,
      responsavel:     a.responsavel,
      dataentrega:     a.dataentrega,
      supervisor:      a.supervisor,
      escritorio:      a.escritorio,
      producao:        a.producao,
      sem_material:    a.semMaterial,
      pendencia:       a.pendencia,
    },
  ];
}

async function atualizarAssistencia(body) {
  await Assistencias.update(
    {
      pedido: body.p_pedido != null && body.p_pedido !== '' ? Number(body.p_pedido) : null,
      corte:  body.p_corte  != null && body.p_corte  !== '' ? Number(body.p_corte)  : null,
      observacoes: body.p_observacao ?? null,
      observacoes2: body.p_observacao2 ?? null,
      iniciado: body.p_iniciado || null,
      pronto: body.p_pronto || null,
      previsao: body.p_previsao || null,
      conferente: body.p_conferente ?? null,
      responsavel: body.p_responsavel ?? null,
      liberacao: body.p_liberacao ?? null,
      dataentrega: body.p_dataentrega || null,
      escritorio: body.p_escritorio ?? false,
      producao: body.p_producao ?? false,
      semMaterial: body.p_sem_material ?? false,
      pendencia: body.p_pendencia ?? false,
    },
    { where: { solicitacao: body.p_solicitacao } },
  );
}

async function buscarCapaAssistencia(p_solicitacao) {
  const a = await Assistencias.findOne({
    where: { solicitacao: p_solicitacao },
    attributes: [
      "contrato",
      "solicitacao",
      "datasolicitacao",
      "urgente",
      "cliente",
      "ambiente",
      "montador",
      "solicitante",
      "supervisor",
    ],
  });
  if (!a) return [];
  return [
    {
      contrato:        a.contrato,
      solicitacao:     a.solicitacao,
      datasolicitacao: a.datasolicitacao,
      urgente:         a.urgente,
      cliente:         a.cliente,
      ambiente:        a.ambiente,
      montador:        a.montador,
      solicitante:     a.solicitante,
      supervisor:      a.supervisor,
    },
  ];
}

async function _gerarSolicitacaoId() {
  const year = new Date().getFullYear();
  const count = await Assistencias.count({
    where: { solicitacao: { [Op.like]: `AS-${year}-%` } },
  });
  return `AS-${year}-${String(count + 1).padStart(3, "0")}`;
}

async function inserirSolicitacao(body) {
  const solicitacao = String(body.solicitacao ?? '').trim();
  if (!solicitacao) throw new Error('Número da solicitação é obrigatório');
  await Assistencias.create({
    solicitacao,
    contrato:        body.contrato ? Number(body.contrato) : null,
    cliente:         body.cliente ?? "",
    ambiente:        body.ambiente ?? null,
    datasolicitacao: body.datasolicitacao ? new Date(body.datasolicitacao) : new Date(),
    solicitante:     body.solicitante ?? null,
    urgente:         body.urgente ?? null,
    observacoes2:    body.observacoes ?? null,
    bairro:          body.bairro ?? null,
    tempo:           body.tempo ?? null,
    destino:         body.destino ?? null,
    supervisor:      body.supervisor ?? null,
    montador:        body.montador ?? null,
    montagem:        body.montagem ?? false,
    promob:          body.promob ?? false,
    entrega:         body.entrega ?? false,
    cobrada:         body.cobrada ?? false,
    tipoassistencia: body.tipoassistencia ? Number(body.tipoassistencia) : 0,
  });
  return [{ solicitacao }];
}

async function inserirSolicitacaoCompleta(body) {
  return sequelize.transaction(async (t) => {
    const solicitacao = String(body.solicitacao ?? '').trim();
    if (!solicitacao) throw new Error('Número da solicitação é obrigatório');

    await Assistencias.create({
      solicitacao,
      contrato:        body.contrato ? Number(body.contrato) : null,
      cliente:         body.cliente ?? "",
      ambiente:        body.ambiente ?? null,
      datasolicitacao: body.datasolicitacao ? new Date(body.datasolicitacao) : new Date(),
      solicitante:     body.solicitante ?? null,
      urgente:         body.urgente ?? null,
      observacoes2:    body.observacoes ?? null,
      bairro:          body.bairro ?? null,
      tempo:           body.tempo ?? null,
      destino:         body.destino ?? null,
      supervisor:      body.supervisor ?? null,
      montador:        body.montador ?? null,
      montagem:        body.montagem ?? false,
      promob:          body.promob ?? false,
      entrega:         body.entrega ?? false,
      cobrada:         body.cobrada ?? false,
      tipoassistencia: body.tipoassistencia ? Number(body.tipoassistencia) : 0,
    }, { transaction: t });

    for (const m of (body.equipe ?? [])) {
      await EquipSat.create({
        idSat: solicitacao,
        idMontador: Number(m.id_montador ?? m.id),
      }, { transaction: t });
    }

    for (const r of (body.pecas ?? [])) {
      if (!r.id_falha || Number(r.id_falha) === 0)
        throw new Error(`Peça "${r.peca ?? 'sem nome'}" não possui tipo de falha informado.`);
      await Pecas.create({
        idAssistencia: solicitacao,
        qtd:          Number(r.qtd) || 0,
        peca:         r.peca ?? null,
        dimensoes:    r.dimensoes ?? null,
        cor:          r.cor ?? null,
        lado:         r.lado ?? null,
        idOcorrencia: r.id_ocorrencia ? Number(r.id_ocorrencia) : null,
        idFalha:      Number(r.id_falha),
        observacoes:  r.observacoes ?? null,
      }, { transaction: t });
    }

    return [{ solicitacao }];
  });
}

module.exports = {
  listarAssistencias,
  buscarAssistencia,
  atualizarAssistencia,
  buscarCapaAssistencia,
  inserirSolicitacao,
  inserirSolicitacaoCompleta,
};
