const { Op } = require("sequelize");
const { Projetos, Clientes, Producao, Avulsos, Acessorios, Etapa } = require("../client/db");
const {
  producaoStatus,
  countPending,
  hasBullet,
  diasRestantes,
} = require("../utils/calcStatus");

async function listarProjetosLogistica(data_condition) {
  const rows = await Projetos.findAll({
    where: { dataentrega: { [Op.gt]: data_condition } },
    attributes: [
      "ordemdecompra",
      "pedido",
      "idEtapa",
      "codcc",
      "cliente",
      "contrato",
      "numproj",
      "ambiente",
      "tipo",
      "chegoufabrica",
      "dataentrega",
      "iniciado",
      "previsao",
      "pronto",
      "entrega",
      "parceado",
      "pendencia",
      "urgente",
    ],
    include: [
      {
        model: Clientes,
        as: "tblCliente",
        attributes: ["name"],
        required: true,
      },
      {
        model: Etapa,
        as: "tblEtapum",
        attributes: ["name"],
        required: false,
      },
      {
        model: Acessorios,
        as: "tblAcessorios",
        attributes: ["recebido"],
        required: false,
      },
    ],
    order: [
      ["dataentrega", "ASC"],
      [{ model: Clientes, as: "tblCliente" }, "name", "ASC"],
    ],
  });

  return rows.map((p) => {
    const acessorios = p.tblAcessorios || [];
    return {
      total: countPending(acessorios),
      a: hasBullet(acessorios),
      ordemdecompra: p.ordemdecompra,
      pedido:   p.pedido,
      id_etapa: p.idEtapa,
      etapa:    p.tblEtapum?.name ?? '',
      codcc:    p.codcc,
      cliente: p.tblCliente?.name ?? p.cliente ?? "",
      contrato: p.contrato,
      numproj: p.numproj,
      ambiente: p.ambiente,
      tipo: p.tipo,
      chegoufabrica: p.chegoufabrica,
      dataentrega: p.dataentrega,
      status: producaoStatus(p),
      prazo: p.entrega ? 0 : diasRestantes(p.dataentrega),
      iniciado: p.iniciado,
      previsao: p.previsao,
      pronto: p.pronto,
      entrega: p.entrega,
    };
  });
}


const STAGES = ["corte","customizacao","coladeira","usinagem","montagem","paineis","acabamento","embalagem"];
const STAGE_ATTRS = STAGES.flatMap((s) => [`${s}inicio`, `${s}fim`, `${s}pausa`]);

function stageStatus(prod, prefix) {
  if (!prod)                      return 'AGUARDE';
  if (prod[`${prefix}fim`])       return 'FINALIZADO';
  if (prod[`${prefix}pausa`])     return 'PAUSADO';
  if (prod[`${prefix}inicio`])    return 'INICIADO';
  return 'AGUARDE';
}

async function buscarProjetoLogistica(ordemdecompra) {
  const p = await Projetos.findOne({
    where: { ordemdecompra },
    attributes: [
      'ordemdecompra', 'contrato', 'codcc', 'ambiente', 'numproj', 'lote',
      'chegoufabrica', 'dataentrega', 'previsao', 'pronto', 'entrega',
    ],
    include: [
      { model: Clientes, as: 'tblCliente',  attributes: ['name'],                          required: false },
      { model: Producao, as: 'tblProducao', attributes: [...STAGE_ATTRS, 'tamanho', 'observacoes'], required: false },
      { model: Avulsos,  as: 'tblAvulso',   attributes: ['totalvolumes'],                  required: false },
    ],
  });

  if (!p) return [];

  const prod = p.tblProducao;
  return [{
    ordemdecompra: p.ordemdecompra,
    cliente:       p.tblCliente?.name ?? null,
    contrato:      p.contrato,
    codcc:         p.codcc,
    ambiente:      p.ambiente,
    numproj:       p.numproj,
    lote:          p.lote,
    chegoufabrica: p.chegoufabrica,
    dataentrega:   p.dataentrega,
    scorte:        stageStatus(prod, 'corte'),
    scustom:       stageStatus(prod, 'customizacao'),
    scoladeira:    stageStatus(prod, 'coladeira'),
    susinagem:     stageStatus(prod, 'usinagem'),
    smontagem:     stageStatus(prod, 'montagem'),
    spaineis:      stageStatus(prod, 'paineis'),
    sacabamento:   stageStatus(prod, 'acabamento'),
    sembalagem:    stageStatus(prod, 'embalagem'),
    previsao:      p.previsao,
    pronto:        p.pronto,
    entrega:       p.entrega,
    tamanho:       prod?.tamanho       ?? '',
    totalvolumes:  p.tblAvulso?.totalvolumes ?? 0,
    observacoes:   prod?.observacoes   ?? '',
  }];
}

module.exports = { listarProjetosLogistica, buscarProjetoLogistica };
