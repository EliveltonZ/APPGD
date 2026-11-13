const { Op, literal } = require("sequelize");
const { Projetos, Liberador } = require("../client/db");
const { assistenciaStatus, diasRestantes } = require("../utils/calcStatus");

// Produção/Logística/Qualidade/Capa continuam falando com "solicitacao" como
// se fosse o identificador real (é só uma string opaca pra eles). Por baixo,
// assistência agora é uma linha de tblProjetos (tipo_pedido='ASSISTENCIA'),
// identificada de verdade por ordemdecompra; numero_solicitacao faz o papel
// do antigo "solicitacao". tblAssistencias fica congelada como histórico.
async function listarAssistencias(data) {
  const rows = await Projetos.findAll({
    where: { tipoProjeto: 'ASSISTENCIA', dataSolicitacao: { [Op.gte]: data } },
    attributes: [
      "numeroSolicitacao",
      "lote",
      "pedidoAssistencia",
      "contrato",
      "cliente",
      "ambiente",
      "dataSolicitacao",
      "prazoFabrica",
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
      [literal("CASE WHEN urgente THEN 0 ELSE 1 END"), "ASC"],
      ["dataSolicitacao", "DESC"],
    ],
  });
  return rows.map((a) => ({
    solicitacao:     a.numeroSolicitacao,
    corte:           a.lote,
    pedido:          a.pedidoAssistencia,
    contrato:        a.contrato,
    cliente:         a.cliente,
    ambiente:        a.ambiente,
    datasolicitacao: a.dataSolicitacao,
    prazo:           a.prazoFabrica ? diasRestantes(a.prazoFabrica) : null,
    status:          assistenciaStatus(a),
    iniciado:        a.iniciado,
    previsao:        a.previsao,
    pronto:          a.pronto,
    dataentrega:     a.dataentrega,
    urgente:         a.urgente ? 'sim' : 'nao',
  }));
}

async function buscarAssistencia(solicitacao) {
  const a = await Projetos.findOne({
    where: { numeroSolicitacao: solicitacao, tipoProjeto: 'ASSISTENCIA' },
  });
  if (!a) return [];

  let liberadorName = null;
  if (a.contrato) {
    const projeto = await Projetos.findOne({
      where: { contrato: a.contrato, tipoProjeto: 'PROJETO' },
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
      solicitacao:     a.numeroSolicitacao,
      contrato:        a.contrato,
      solicitante:     a.responsavel,
      datasolicitacao: a.dataSolicitacao,
      previsao:        a.previsao,
      cliente:         a.cliente,
      pedido:          a.pedidoAssistencia,
      corte:           a.lote,
      ambiente:        a.ambiente,
      situacao:        assistenciaStatus(a),
      urgente:         a.urgente ? 'sim' : 'nao',
      // Nota de fábrica/logística (livremente editadas depois, não é a nota
      // original do pedido) — por isso lê de observacoes2, não observacoes.
      observacao:      a.observacoes2,
      observacao2:     a.observacoes,
      iniciado:        a.iniciado,
      pronto:          a.pronto,
      conferente:      a.conferente,
      liberacao:       a.liberacao,
      liberador:       liberadorName,
      responsavel:     a.motorista,
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
  await Projetos.update(
    {
      pedidoAssistencia: body.pedido != null && body.pedido !== '' ? Number(body.pedido) : null,
      lote:  body.corte  != null && body.corte  !== '' ? Number(body.corte)  : null,
      observacoes2: body.observacao ?? null,
      observacoes: body.observacao2 ?? null,
      iniciado: body.iniciado || null,
      pronto: body.pronto || null,
      previsao: body.previsao || null,
      conferente: body.conferente ?? null,
      motorista: body.responsavel ?? null,
      liberacao: body.liberacao ?? null,
      dataentrega: body.dataentrega || null,
      escritorio: body.escritorio ?? false,
      producao: body.producao ?? false,
      semMaterial: body.sem_material ?? false,
      pendencia: body.pendencia ?? false,
    },
    { where: { numeroSolicitacao: body.solicitacao, tipoProjeto: 'ASSISTENCIA' } },
  );
}

async function buscarCapaAssistencia(solicitacao) {
  const a = await Projetos.findOne({
    where: { numeroSolicitacao: solicitacao, tipoProjeto: 'ASSISTENCIA' },
    attributes: [
      "contrato",
      "numeroSolicitacao",
      "dataSolicitacao",
      "urgente",
      "cliente",
      "ambiente",
      "montador",
      "responsavel",
      "supervisor",
    ],
  });
  if (!a) return [];
  return [
    {
      contrato:        a.contrato,
      solicitacao:     a.numeroSolicitacao,
      datasolicitacao: a.dataSolicitacao,
      urgente:         a.urgente ? 'sim' : 'nao',
      cliente:         a.cliente,
      ambiente:        a.ambiente,
      montador:        a.montador,
      solicitante:     a.responsavel,
      supervisor:      a.supervisor,
    },
  ];
}

module.exports = {
  listarAssistencias,
  buscarAssistencia,
  atualizarAssistencia,
  buscarCapaAssistencia,
};
