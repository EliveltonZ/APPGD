const { Op } = require('sequelize');
const { Acessorios, Projetos, Clientes, Categorias } = require('../client/db');

async function buscarContratoPendencia(p_contrato) {
  const rows = await Projetos.findAll({
    where: { contrato: Number(p_contrato) },
    attributes: ['ordemdecompra', 'ambiente', 'dataentrega'],
    include: [{ model: Clientes, as: 'tblCliente', attributes: ['name'], required: true }],
  });
  if (!rows.length) return [];

  const ordemIds = rows.map(p => p.ordemdecompra);
  const allAcessorios = await Acessorios.findAll({
    where: { ordemdecompra: ordemIds },
    attributes: ['ordemdecompra', 'previsao', 'recebido'],
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const acessMap = {};
  for (const a of allAcessorios) {
    const key = String(a.ordemdecompra);
    if (!acessMap[key]) acessMap[key] = [];
    acessMap[key].push(a);
  }

  return rows.map(p => {
    const ac = acessMap[String(p.ordemdecompra)] || [];
    return {
      ordemdecompra: p.ordemdecompra,
      cliente:       p.tblCliente?.name ?? null,
      ambiente:      p.ambiente,
      dataentrega:   p.dataentrega,
      total:         ac.length,
      recebidos:     ac.filter(a => a.recebido != null).length,
      atrasados:     ac.filter(a =>
        a.recebido == null && a.previsao != null && new Date(a.previsao) < today
      ).length,
    };
  });
}

async function getAcessoriosPendencias(p_ordemdecompra) {
  return Acessorios.findAll({
    where: { ordemdecompra: Number(p_ordemdecompra) },
    attributes: ['id', 'categoria', 'descricao', 'medida', 'qtd', 'fornecedor', 'datacompra', 'previsao', 'recebido'],
    raw: true,
  });
}

async function listarAcessoriosPendencias(p_ordemdecompra) {
  const rows = await Acessorios.findAll({
    where: { ordemdecompra: Number(p_ordemdecompra) },
    attributes: ['id', 'idCategoria', 'descricao', 'medida', 'qtd', 'fornecedor', 'datacompra', 'previsao', 'recebido'],
    include: [{ model: Categorias, as: 'tblCategoria', attributes: ['name'] }],
  });
  return rows.map(a => ({
    id:          a.id,
    id_categoria: a.idCategoria,
    categoria:   a.tblCategoria?.name ?? null,
    descricao:   a.descricao,
    medida:      a.medida,
    qtd:         a.qtd,
    fornecedor:  a.fornecedor,
    datacompra:  a.datacompra,
    previsao:    a.previsao,
    recebido:    a.recebido,
  }));
}

async function inserirAcessorios(body) {
  await Acessorios.create({
    ordemdecompra: body.p_ordemdecompra,
    idCategoria:   body.p_id_categoria ? Number(body.p_id_categoria) : null,
    descricao:     body.p_descricao    ?? null,
    medida:        body.p_medida       ?? null,
    qtd:           body.p_quantidade ? Number(body.p_quantidade) : 0,
    fornecedor:    body.p_fornecedor   ?? null,
    datacompra:    body.p_compra       ?? null,
    previsao:      body.p_previsao     ?? null,
    recebido:      body.p_recebido     ?? null,
  });
}

async function deletarAcessorio(p_id) {
  await Acessorios.destroy({ where: { id: Number(p_id) } });
}

async function atualizarAcessorios(body) {
  await Acessorios.update(
    {
      idCategoria:  body.p_id_categoria ? Number(body.p_id_categoria) : null,
      descricao:    body.p_descricao    ?? null,
      medida:       body.p_medida       ?? null,
      parcelamento: body.p_parcelamento ? Number(body.p_parcelamento) : null,
      numcard:      body.p_numcard      ?? null,
      qtd:          body.p_qtd         ? Number(body.p_qtd)          : 0,
      fornecedor:   body.p_fornecedor   ?? null,
      datacompra:   body.p_datacompra   ?? null,
      previsao:     body.p_previsao     ?? null,
      recebido:     body.p_recebido     ?? null,
    },
    { where: { id: Number(body.p_id) } }
  );
}

async function listarCategoria() {
  const rows = await Categorias.findAll({ order: [['id', 'ASC']] });
  return rows.map(r => ({ id: r.id, categoria: r.name }));
}

module.exports = {
  buscarContratoPendencia,
  getAcessoriosPendencias,
  listarAcessoriosPendencias,
  inserirAcessorios,
  deletarAcessorio,
  atualizarAcessorios,
  listarCategoria,
};
