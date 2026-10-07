'use strict';
const { Op, QueryTypes } = require('sequelize');
const {
  sequelize, Materiais, XmlConsumo, XmlImportacoes,
  EstoqueMovimentos, SolicitacaoComprasItens, Projetos, MateriaisCodigoNF,
} = require('../client/db');

async function buscarMaterial(id) {
  return Materiais.findByPk(id, { raw: true });
}

async function saldoFisico(materialId) {
  const total = await EstoqueMovimentos.sum('qtdUn', { where: { materialId } });
  return Number(total) || 0;
}

async function saldoReservado(materialId) {
  const total = await XmlConsumo.sum('qtdUnConfirmada', {
    where: { materialId, status: 'RESERVADO' },
  });
  return Number(total) || 0;
}

async function saldoComprado(materialId) {
  const total = await SolicitacaoComprasItens.sum('quantidade', {
    where: {
      materialId, cancelado: false,
      dataComprado: { [Op.ne]: null },
      nfItemId: null,
    },
  });
  return Number(total) || 0;
}

async function saldoSolicitado(materialId) {
  const total = await SolicitacaoComprasItens.sum('quantidade', {
    where: { materialId, cancelado: false, dataComprado: null },
  });
  return Number(total) || 0;
}

// Preço (e fornecedor da compra) vigente na data informada — última nota
// fiscal com data_entrada <= data. O fornecedor importa pra materiais tipo M
// (fita): o comprimento do rolo varia por fornecedor.
async function buscarPrecoNaData(materialId, data) {
  if (!data) return null;
  const rows = await sequelize.query(
    `SELECT nfi.preco_un, nf.fornecedor_id
     FROM "tblNotasFiscaisItens" nfi
     JOIN "tblNotasFiscais" nf ON nf.id = nfi.nota_fiscal_id
     WHERE nfi.material_id = :materialId AND nf.data_entrada <= :data
     ORDER BY nf.data_entrada DESC
     LIMIT 1`,
    { replacements: { materialId, data }, type: QueryTypes.SELECT },
  );
  if (!rows[0]) return null;
  return { preco: rows[0].preco_un, fornecedorId: rows[0].fornecedor_id };
}

// Fator de conversão (quantidade física por UN de compra) específico do
// fornecedor — ex.: um rolo de fita pode ter 20m com um fornecedor e 300m
// com outro. Sem isso cadastrado, não há como converter com segurança.
async function buscarFatorConversaoFornecedor(materialId, fornecedorId) {
  if (!fornecedorId) return null;
  const row = await MateriaisCodigoNF.findOne({
    where: { materialId, fornecedorId }, raw: true,
  });
  return row?.m2PorUnidade ?? null;
}

async function buscarChegouFabrica(ordemdecompra) {
  const projeto = await Projetos.findOne({
    where: { ordemdecompra }, attributes: ['chegoufabrica'], raw: true,
  });
  return projeto?.chegoufabrica ?? null;
}

async function buscarXmlConsumo(id) {
  return XmlConsumo.findByPk(id);
}

async function listarXmlConsumoPorPedido(ordemdecompra) {
  return XmlConsumo.findAll({ where: { ordemdecompra }, order: [['id', 'ASC']] });
}

async function listarPendentesOuReservados(materialId) {
  return XmlConsumo.findAll({
    where: { materialId, status: { [Op.in]: ['PENDENTE', 'RESERVADO'] } },
    order: [['dataImportacao', 'ASC']],
  });
}

async function criarMovimento(dados, options) {
  return EstoqueMovimentos.create(dados, options);
}

async function buscarMateriaisPorId(ids) {
  return Materiais.findAll({ where: { id: { [Op.in]: ids } }, raw: true });
}

async function criarImportacao(dados) {
  return XmlImportacoes.create(dados);
}

async function criarConsumos(rows) {
  return XmlConsumo.bulkCreate(rows);
}

async function listarAbaixoDoMinimo() {
  const rows = await sequelize.query(
    `SELECT m.id, m.codigo_interno, m.descricao, m.unidade_base, m.estoque_minimo_un,
            COALESCE((SELECT SUM(qtd_un) FROM "tblEstoqueMovimentos" WHERE material_id = m.id), 0) AS fisico,
            COALESCE((SELECT SUM(qtd_un_confirmada) FROM "tblXmlConsumo" WHERE material_id = m.id AND status = 'RESERVADO'), 0) AS reservado,
            COALESCE((SELECT SUM(quantidade) FROM "tblSolicitacaoComprasItens" WHERE material_id = m.id AND cancelado = false AND data_comprado IS NOT NULL AND nf_item_id IS NULL), 0) AS comprado
     FROM "tblMateriais" m
     WHERE m.ativo = true AND m.estoque_minimo_un IS NOT NULL AND m.estoque_minimo_un > 0`,
    { type: QueryTypes.SELECT },
  );
  return rows
    .map(r => ({
      id: r.id,
      codigoInterno: r.codigo_interno,
      descricao: r.descricao,
      unidadeBase: r.unidade_base,
      estoqueMinimoUn: Number(r.estoque_minimo_un),
      saldoBloqueio: Number(r.fisico) - Number(r.reservado) + Number(r.comprado),
    }))
    .filter(r => r.saldoBloqueio <= r.estoqueMinimoUn);
}

module.exports = {
  buscarMaterial,
  saldoFisico,
  saldoReservado,
  saldoComprado,
  saldoSolicitado,
  buscarPrecoNaData,
  buscarFatorConversaoFornecedor,
  buscarChegouFabrica,
  buscarXmlConsumo,
  listarXmlConsumoPorPedido,
  listarPendentesOuReservados,
  criarMovimento,
  listarAbaixoDoMinimo,
  buscarMateriaisPorId,
  criarImportacao,
  criarConsumos,
  sequelize,
};
