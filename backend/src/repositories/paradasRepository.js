const { Op } = require('sequelize');
const {
  sequelize,
  Maquinas,
  TipoRequisicao,
  Paradas,
  ParadasHistorico,
  Projetos,
  Assistencias,
  Clientes,
  Usuario,
} = require('../client/db');

function fmtDate(d = new Date()) {
  return new Date(d)
    .toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' })
    .replace(',', '');
}

// ─── Lookup ───────────────────────────────────────────────────────────────────

async function listarMaquinas() {
  return Maquinas.findAll({ order: [['nome', 'ASC']] });
}

async function listarTipos() {
  return TipoRequisicao.findAll({ order: [['id', 'ASC']] });
}

async function buscarPedido(id_tipo, pedido) {
  if (id_tipo === 1) {
    const row = await Projetos.findOne({
      where: { pedido },
      attributes: ['pedido', 'ambiente'],
      include: [{ model: Clientes, as: 'tblCliente', attributes: ['name'], required: false }],
    });
    if (!row) return null;
    return { pedido: row.pedido, cliente: row.tblCliente?.name ?? null, ambiente: row.ambiente };
  }

  const row = await Assistencias.findOne({
    where: { pedido },
    attributes: ['pedido', 'cliente', 'ambiente'],
  });
  if (!row) return null;
  return { pedido: row.pedido, cliente: row.cliente, ambiente: row.ambiente };
}

// ─── Estado atual ─────────────────────────────────────────────────────────────

async function buscarAberta(id_maquina) {
  const row = await Paradas.findOne({
    where: { id_maquina, data_fim: null },
    attributes: ['id', 'pedido', 'data_inicio', 'id_tipo'],
    include: [{ model: TipoRequisicao, as: 'tipo', attributes: ['descricao'] }],
  });
  if (!row) return null;
  return {
    id:          row.id,
    pedido:      row.pedido,
    data_inicio: row.data_inicio,
    id_tipo:     row.id_tipo,
    tipo:        row.tipo?.descricao ?? null,
  };
}

async function listarAbertas() {
  const rows = await Paradas.findAll({
    where: { data_fim: null },
    attributes: ['id', 'pedido', 'data_inicio', 'id_maquina', 'id_tipo', 'id_usuario'],
    include: [
      { model: Maquinas,       as: 'maquina', attributes: ['nome']      },
      { model: TipoRequisicao, as: 'tipo',    attributes: ['descricao'] },
    ],
    order: [['data_inicio', 'DESC']],
  });
  return rows.map(p => ({
    id:          p.id,
    pedido:      p.pedido,
    data_inicio: p.data_inicio,
    id_maquina:  p.id_maquina,
    maquina:     p.maquina?.nome       ?? null,
    id_tipo:     p.id_tipo,
    tipo:        p.tipo?.descricao     ?? null,
    id_usuario:  p.id_usuario,
  }));
}

// ─── Operações do operador ────────────────────────────────────────────────────

async function iniciar({ pedido, id_maquina, id_tipo, id_usuario }) {
  const aberta = await buscarAberta(id_maquina);
  if (aberta) {
    const err = new Error(`Máquina já possui uma parada em aberto (id: ${aberta.id})`);
    err.code = 'MAQUINA_EM_PARADA';
    throw err;
  }
  return Paradas.create({ pedido, id_maquina, id_tipo, id_usuario, data_inicio: fmtDate() });
}

async function finalizar(id_maquina) {
  const aberta = await buscarAberta(id_maquina);
  if (!aberta) {
    const err = new Error('Nenhuma parada em aberto para esta máquina');
    err.code = 'SEM_PARADA_ABERTA';
    throw err;
  }
  await Paradas.update({ data_fim: fmtDate() }, { where: { id: aberta.id } });
  return aberta;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

async function listarTodas({ data_inicio_de, data_inicio_ate, id_maquina } = {}) {
  const where = {};
  if (id_maquina) where.id_maquina = Number(id_maquina);
  if (data_inicio_de || data_inicio_ate) {
    where.data_inicio = {};
    if (data_inicio_de) where.data_inicio[Op.gte] = data_inicio_de;
    if (data_inicio_ate) where.data_inicio[Op.lte] = data_inicio_ate;
  }

  const rows = await Paradas.findAll({
    where,
    attributes: ['id', 'pedido', 'data_inicio', 'data_fim', 'id_maquina', 'id_tipo', 'id_usuario'],
    include: [
      { model: Maquinas,       as: 'maquina', attributes: ['nome']      },
      { model: TipoRequisicao, as: 'tipo',    attributes: ['descricao'] },
    ],
    order: [['data_inicio', 'DESC']],
  });

  return rows.map(p => ({
    id:          p.id,
    pedido:      p.pedido,
    data_inicio: p.data_inicio,
    data_fim:    p.data_fim,
    id_maquina:  p.id_maquina,
    maquina:     p.maquina?.nome      ?? null,
    id_tipo:     p.id_tipo,
    tipo:        p.tipo?.descricao    ?? null,
    id_usuario:  p.id_usuario,
  }));
}

async function editarParada(id, changes, id_usuario) {
  const parada = await Paradas.findByPk(id);
  if (!parada) return null;

  const campos = ['pedido', 'data_inicio', 'data_fim', 'id_maquina'];
  const historico = [];

  if (changes.data_inicio) changes.data_inicio = new Date(changes.data_inicio);
  if (changes.data_fim)    changes.data_fim    = new Date(changes.data_fim);

  for (const campo of campos) {
    if (!(campo in changes)) continue;
    const anterior = parada[campo];
    const novo = changes[campo];
    if (String(anterior ?? '') === String(novo ?? '')) continue;

    historico.push({
      parada_id:      id,
      campo,
      valor_anterior: anterior != null ? String(anterior) : null,
      valor_novo:     novo     != null ? String(novo)     : null,
      alterado_por:   id_usuario,
      alterado_em:    fmtDate(),
    });

    parada[campo] = novo;
  }

  if (!historico.length) return parada;

  await sequelize.transaction(async (t) => {
    await parada.save({ transaction: t });
    await ParadasHistorico.bulkCreate(historico, { transaction: t });
  });

  return parada;
}

async function listarHistorico(parada_id) {
  const rows = await ParadasHistorico.findAll({
    where: { parada_id: Number(parada_id) },
    attributes: ['id', 'campo', 'valor_anterior', 'valor_novo', 'alterado_em'],
    include: [{ model: Usuario, as: 'usuario', attributes: ['login'] }],
    order: [['alterado_em', 'DESC']],
  });
  return rows.map(h => ({
    id:               h.id,
    campo:            h.campo,
    valor_anterior:   h.valor_anterior,
    valor_novo:       h.valor_novo,
    alterado_em:      h.alterado_em,
    alterado_por_nome: h.usuario?.login ?? null,
  }));
}

module.exports = {
  listarMaquinas,
  listarTipos,
  buscarPedido,
  buscarAberta,
  listarAbertas,
  iniciar,
  finalizar,
  listarTodas,
  editarParada,
  listarHistorico,
};
