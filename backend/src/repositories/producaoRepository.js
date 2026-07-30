const { Op } = require("sequelize");
const {
  Projetos, Clientes, Acessorios, Producao, Usuario,
} = require("../client/db");
const { producaoStatus, countPending, hasBullet } = require("../utils/calcStatus");

const STAGES = ["corte","customizacao","coladeira","usinagem","montagem","paineis","acabamento","embalagem"];

const STAGE_ATTRS = STAGES.flatMap((s) => [`${s}inicio`, `${s}fim`, `${s}pausa`, `${s}resp`]);

async function _buildUserMap(prods) {
  const ids = new Set();
  for (const prod of prods) {
    for (const s of STAGES) {
      const id = prod[`${s}resp`];
      if (id) ids.add(Number(id));
    }
  }
  if (!ids.size) return new Map();
  const users = await Usuario.findAll({ where: { id: [...ids] }, attributes: ['id', 'login'] });
  return new Map(users.map((u) => [Number(u.id), u.login]));
}

function _mapStageRow(projeto, prod, userMap) {
  const row = {
    ordemdecompra: projeto.ordemdecompra,
    pedido:        projeto.pedido,
    cliente:       projeto.tblCliente?.name ?? '',
    contrato:      projeto.contrato,
    codcc:         projeto.codcc,
    ambiente:      projeto.ambiente,
    numproj:       projeto.numproj,
    lote:          projeto.lote,
    chegoufabrica: projeto.chegoufabrica,
    dataentrega:   projeto.dataentrega,
    previsao:      projeto.previsao,
    observacoes:   prod.observacoes,
  };
  for (const s of STAGES) {
    row[`${s}inicio`] = prod[`${s}inicio`] ?? null;
    row[`${s}fim`]    = prod[`${s}fim`]    ?? null;
    row[`${s}pausa`]  = prod[`${s}pausa`]  ?? false;
    row[`${s}resp`]   = prod[`${s}resp`]   ?? null;
    row[`${s}name`]   = prod[`${s}resp`] ? (userMap.get(Number(prod[`${s}resp`])) ?? null) : null;
  }
  return row;
}

async function listarProjetosProducao() {
  const rows = await Projetos.findAll({
    where: {
      [Op.or]: [
        { entrega: null },
        { parceado: true },
        { pendencia: true },
      ],
    },
    attributes: [
      'ordemdecompra', 'pedido', 'etapa', 'codcc', 'cliente', 'contrato',
      'numproj', 'ambiente', 'tipo', 'chegoufabrica', 'dataentrega', 'lote',
      'iniciado', 'previsao', 'pronto', 'entrega', 'parceado', 'pendencia', 'urgente',
    ],
    include: [
      { model: Clientes,   as: 'tblCliente',   attributes: ['name'],        required: false },
      { model: Acessorios, as: 'tblAcessorios', attributes: ['recebido'],    required: false },
      { model: Producao,   as: 'tblProducao',   attributes: ['observacoes'], required: false },
    ],
  });

  return rows
    .sort((a, b) => {
      const da = a.dataentrega || '';
      const db = b.dataentrega || '';
      if (da !== db) return da < db ? -1 : 1;
      const ca = a.tblCliente?.name || a.cliente || '';
      const cb = b.tblCliente?.name || b.cliente || '';
      if (ca !== cb) return ca < cb ? -1 : 1;
      return (a.numproj || '') < (b.numproj || '') ? -1 : 1;
    })
    .map((p) => {
      const acessorios = p.tblAcessorios || [];
      return {
        total:         countPending(acessorios),
        a:             hasBullet(acessorios),
        ordemdecompra: p.ordemdecompra,
        pedido:        p.pedido,
        etapa:         p.etapa ?? '-',
        codcc:         p.codcc,
        cliente:       p.tblCliente?.name ?? p.cliente ?? '',
        contrato:      p.contrato,
        numproj:       p.numproj,
        ambiente:      p.ambiente,
        tipo:          p.tipo,
        chegoufabrica: p.chegoufabrica,
        dataentrega:   p.dataentrega,
        lote:          p.lote,
        status:        producaoStatus(p),
        iniciado:      p.iniciado,
        previsao:      p.previsao,
        pronto:        p.pronto,
        entrega:       p.entrega,
        observacoes:   p.tblProducao?.observacoes ?? null,
      };
    });
}

async function buscarProjetoProducao(ordemdecompra) {
  const projeto = await Projetos.findOne({
    where: { ordemdecompra: Number(ordemdecompra) },
    attributes: [
      'ordemdecompra', 'contrato', 'codcc', 'ambiente', 'numproj',
      'lote', 'chegoufabrica', 'dataentrega', 'previsao',
    ],
    include: [
      { model: Clientes, as: 'tblCliente', attributes: ['name'], required: true },
      { model: Producao, as: 'tblProducao', required: true, attributes: [...STAGE_ATTRS, 'observacoes'] },
    ],
  });

  if (!projeto) return [];

  const prod    = projeto.tblProducao;
  const userMap = await _buildUserMap([prod]);
  return [_mapStageRow(projeto, prod, userMap)];
}

async function buscarProducaoPorPedido(pedido) {
  const projetos = await Projetos.findAll({
    where: { pedido: Number(pedido) },
    attributes: [
      'ordemdecompra', 'pedido', 'contrato', 'codcc', 'ambiente', 'numproj',
      'lote', 'chegoufabrica', 'dataentrega', 'previsao',
    ],
    include: [
      { model: Clientes, as: 'tblCliente', attributes: ['name'], required: true },
      { model: Producao, as: 'tblProducao', required: true, attributes: [...STAGE_ATTRS, 'observacoes'] },
    ],
  });

  if (!projetos.length) return [];

  const userMap = await _buildUserMap(projetos.map((p) => p.tblProducao));
  return projetos.map((p) => _mapStageRow(p, p.tblProducao, userMap));
}

async function listarAcessorios(ordemdecompra) {
  return Acessorios.findAll({
    where: { ordemdecompra: Number(ordemdecompra) },
    attributes: ['id', 'categoria', 'descricao', 'medida', 'qtd', 'datacompra', 'previsao', 'recebido'],
    order: [['id', 'ASC']],
    raw: true,
  });
}

async function atualizarDadosProducao(body) {
  const values = { observacoes: body.p_observacoes ?? null };
  for (const s of STAGES) {
    values[`${s}inicio`] = body[`p_${s}inicio`] ?? null;
    values[`${s}fim`]    = body[`p_${s}fim`]    ?? null;
    values[`${s}resp`]   = body[`p_${s}resp`]   ?? null;
    values[`${s}pausa`]  = body[`p_${s}pausa`]  ?? false;
  }

  await Producao.update(values, { where: { ordemdecompra: body.p_ordemdecompra } });
  await Projetos.update(
    { previsao: body.p_previsao ?? null },
    { where: { ordemdecompra: body.p_ordemdecompra } },
  );
}

module.exports = {
  listarProjetosProducao,
  buscarProjetoProducao,
  buscarProducaoPorPedido,
  listarAcessorios,
  atualizarDadosProducao,
};
