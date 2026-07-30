const { Op } = require("sequelize");
const { Projetos, Clientes, Vendedor } = require("../client/db");
const { formatDateBR } = require("../utils/calcStatus");

async function buscarProjetoPcp(ordemdecompra) {
  const found = await Projetos.findOne({
    where: { ordemdecompra: Number(ordemdecompra) },
    attributes: [
      'contrato', 'urgente', 'codcc', 'ambiente', 'numproj', 'lote',
      'pedido', 'chegoufabrica', 'dataentrega', 'tipo', 'pecas', 'area',
    ],
    include: [{ model: Clientes, as: 'tblCliente', attributes: ['name'] }],
  });
  if (!found) return [];
  return [{
    contrato:      found.contrato,
    urgente:       found.urgente,
    cliente:       found.tblCliente?.name ?? '',
    codcc:         found.codcc,
    ambiente:      found.ambiente,
    numproj:       found.numproj,
    lote:          found.lote,
    pedido:        found.pedido,
    chegoufabrica: found.chegoufabrica,
    dataentrega:   found.dataentrega,
    tipo:          found.tipo,
    pecas:         found.pecas,
    area:          found.area,
  }];
}

async function buscarUltimoLote() {
  const lote = await Projetos.max('lote');
  return [{ lote: lote ?? 0 }];
}

async function listarProjetosLote() {
  const rows = await Projetos.findAll({
    where: { codcc: { [Op.gt]: 0 }, lote: 0 },
    attributes: ['ordemdecompra', 'pedido', 'codcc', 'ambiente', 'dataentrega'],
    include: [{ model: Clientes, as: 'tblCliente', attributes: ['name'] }],
    order: [['codcc', 'ASC']],
  });
  return rows.map((p) => ({
    ordemdecompra: p.ordemdecompra,
    pedido:        p.pedido,
    codcc:         p.codcc,
    cliente:       p.tblCliente?.name ?? '',
    ambiente:      p.ambiente,
    dataentrega:   p.dataentrega,
  }));
}

async function listarLotes() {
  const rows = await Projetos.findAll({
    where: { iniciado: null, lote: { [Op.gt]: 0 } },
    attributes: ['lote'],
    group: ['lote'],
    order: [['lote', 'ASC']],
  });
  return rows.map((p) => ({ lote: p.lote }));
}

async function atualizarIniciarLote(p_lote, p_iniciado) {
  await Projetos.update(
    { iniciado: p_iniciado ?? null },
    { where: { lote: Number(p_lote) } },
  );
}

async function atualizarLote(p_ordemdecompra, p_lote) {
  await Projetos.update(
    { lote: Number(p_lote) },
    { where: { ordemdecompra: Number(p_ordemdecompra) } },
  );
}

async function atualizarProjetoPcp(body) {
  await Projetos.update(
    {
      urgente: body.p_urgente ?? false,
      codcc:   body.p_codcc   ? Number(body.p_codcc)   : 0,
      lote:    body.p_lote    ? Number(body.p_lote)    : 0,
      pedido:  body.p_pedido  ? Number(body.p_pedido)  : 0,
      tipo:    body.p_tipo    ?? null,
      pecas:   body.p_pecas   ? Number(body.p_pecas)   : 0,
      area:    body.p_area    ? Number(body.p_area)    : 0,
    },
    { where: { ordemdecompra: body.p_ordemdecompra } },
  );
}

async function exportarProjetosPeriodo(data_inicio, data_fim) {
  const rows = await Projetos.findAll({
    where: {
      chegoufabrica: { [Op.gte]: data_inicio, [Op.lte]: data_fim },
    },
    attributes: ['ordemdecompra', 'contrato', 'ambiente', 'numproj', 'chegoufabrica', 'dataentrega'],
    include: [
      { model: Clientes, as: 'tblCliente',  attributes: ['name'], required: false },
      { model: Vendedor, as: 'tblVendedor', attributes: ['name'], required: false },
    ],
    order: [['chegoufabrica', 'DESC']],
  });
  return rows.map((p) => ({
    ordemdecompra: p.ordemdecompra,
    contrato:      p.contrato,
    cliente:       p.tblCliente?.name  ?? '',
    ambiente:      p.ambiente,
    numproj:       p.numproj,
    chegoufabrica: formatDateBR(p.chegoufabrica),
    dataentrega:   formatDateBR(p.dataentrega),
    vendedor:      p.tblVendedor?.name ?? '',
  }));
}

async function buscarPcpCard() {
  const [disponivel, em_lote, em_producao, concluido] = await Promise.all([
    Projetos.count({ where: { lote: 0 } }),
    Projetos.count({ where: { lote: { [Op.gt]: 0 }, iniciado: null, entrega: null } }),
    Projetos.count({ where: { lote: { [Op.gt]: 0 }, iniciado: { [Op.ne]: null }, pronto: null, entrega: null } }),
    Projetos.count({ where: { lote: { [Op.gt]: 0 }, iniciado: { [Op.ne]: null }, pronto: { [Op.ne]: null }, entrega: null } }),
  ]);
  return [{ disponivel, em_lote, em_producao, concluido }];
}

module.exports = {
  buscarProjetoPcp,
  buscarUltimoLote,
  listarProjetosLote,
  listarLotes,
  atualizarIniciarLote,
  atualizarLote,
  atualizarProjetoPcp,
  exportarProjetosPeriodo,
  buscarPcpCard,
};
