const {
  Clientes, Etapa, Loja, TipoCliente, Montador,
  Vendedor, Liberador, TipoContrato, Falhas, Causa,
} = require('../client/db')

const ENTITY_MAP = {
  clientes:        { model: Clientes,    pk: 'id',     field: 'name' },
  etapas:          { model: Etapa,       pk: 'id',     field: 'name' },
  lojas:           { model: Loja,        pk: 'id',     field: 'name' },
  'tipo-cliente':  { model: TipoCliente, pk: 'id',     field: 'name' },
  montadores:      { model: Montador,    pk: 'id',     field: 'name', extra: ['password'] },
  vendedores:      { model: Vendedor,    pk: 'id',     field: 'name' },
  liberadores:     { model: Liberador,   pk: 'id',     field: 'name' },
  'tipo-contrato': { model: TipoContrato,pk: 'id',     field: 'name' },
  falhas:          { model: Falhas,      pk: 'codigo', field: 'descricao' },
  causas:          { model: Causa,       pk: 'id',     field: 'descricao' },
}

function toRow(entity, record) {
  const { pk, field, extra = [] } = ENTITY_MAP[entity]
  const row = { id: record[pk], label: record[field] }
  for (const col of extra) row[col] = record[col] ?? null
  return row
}

async function listar(entity) {
  const { model, pk, field, extra = [] } = ENTITY_MAP[entity]
  const attrs = [pk, field, ...extra]
  const rows = await model.findAll({ attributes: attrs, order: [[field, 'ASC']] })
  return rows.map((r) => toRow(entity, r))
}

async function criar(entity, data) {
  const { model, field, extra = [] } = ENTITY_MAP[entity]
  const values = { [field]: data.label }
  for (const col of extra) if (data[col] !== undefined) values[col] = data[col]
  const record = await model.create(values)
  return toRow(entity, record)
}

async function atualizar(entity, id, data) {
  const { model, pk, field, extra = [] } = ENTITY_MAP[entity]
  const record = await model.findOne({ where: { [pk]: id } })
  if (!record) return null
  record[field] = data.label
  for (const col of extra) if (data[col] !== undefined) record[col] = data[col]
  await record.save()
  return toRow(entity, record)
}

async function excluir(entity, id) {
  const { model, pk } = ENTITY_MAP[entity]
  const deleted = await model.destroy({ where: { [pk]: id } })
  return deleted > 0
}

function entityExists(entity) {
  return Object.prototype.hasOwnProperty.call(ENTITY_MAP, entity)
}

module.exports = { listar, criar, atualizar, excluir, entityExists }
