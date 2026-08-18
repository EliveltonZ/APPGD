const { Op } = require('sequelize');
const { Acessorios, Projetos, Clientes, Categorias } = require('../client/db');

async function buscarContratoPendencia(contrato) {
  const rows = await Projetos.findAll({
    where: { contrato: Number(contrato) },
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

async function getAcessoriosPendencias(ordemdecompra) {
  return Acessorios.findAll({
    where: { ordemdecompra: Number(ordemdecompra) },
    attributes: ['id', 'categoria', 'descricao', 'medida', 'qtd', 'fornecedor', 'datacompra', 'previsao', 'recebido'],
    raw: true,
  });
}

async function listarAcessoriosPendencias(ordemdecompra) {
  const rows = await Acessorios.findAll({
    where: { ordemdecompra: Number(ordemdecompra) },
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
    ordemdecompra: body.ordemdecompra,
    idCategoria:   body.id_categoria ? Number(body.id_categoria) : null,
    descricao:     body.descricao    ?? null,
    medida:        body.medida       ?? null,
    qtd:           body.quantidade ? Number(body.quantidade) : 0,
    fornecedor:    body.fornecedor   ?? null,
    datacompra:    body.compra       ?? null,
    previsao:      body.previsao     ?? null,
    recebido:      body.recebido     ?? null,
  });
}

async function deletarAcessorio(id) {
  await Acessorios.destroy({ where: { id: Number(id) } });
}

async function atualizarAcessorios(body) {
  await Acessorios.update(
    {
      idCategoria:  body.id_categoria ? Number(body.id_categoria) : null,
      descricao:    body.descricao    ?? null,
      medida:       body.medida       ?? null,
      parcelamento: body.parcelamento ? Number(body.parcelamento) : null,
      numcard:      body.numcard      ?? null,
      qtd:          body.qtd         ? Number(body.qtd)          : 0,
      fornecedor:   body.fornecedor   ?? null,
      datacompra:   body.datacompra   ?? null,
      previsao:     body.previsao     ?? null,
      recebido:     body.recebido     ?? null,
    },
    { where: { id: Number(body.id) } }
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
