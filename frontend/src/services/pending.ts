import { apiGet, apiPost, apiPut } from './api'
import { toDateInput } from '../utils/dateUtils'
import { fetchCategories, type Category } from './utils'
import type { PendingItem, PendingProject } from '../types/pending'

type RawRow = Record<string, unknown>

export type PendingCategory = Category

export function fetchPendingCategories() {
  return fetchCategories()
}

export async function fetchPendingItems(
  ordemdecompra: number,
): Promise<PendingItem[]> {
  const rows = await apiGet<RawRow[]>('/pendencias/acessorios', {
    ordemdecompra,
  })
  return rows.map((r) => ({
    id:          Number(r.id),
    categoriaId: Number(r.id_categoria ?? 0),
    categoria:   String(r.categoria ?? ''),
    descricao:   String(r.descricao  ?? ''),
    medida:      String(r.medida     ?? ''),
    qtd:         Number(r.qtd),
    fornecedor:  String(r.fornecedor ?? ''),
    compra:      toDateInput(r.datacompra),
    previsao:    toDateInput(r.previsao),
    recebido:    toDateInput(r.recebido),
  }))
}

export async function fetchPendingByContract(
  contrato: string,
): Promise<PendingProject[]> {
  const rows = await apiGet<RawRow[]>('/pendencias/contrato', { contrato })
  return rows.map((r) => ({
    id:        Number(r.ordemdecompra),
    numOC:     String(r.ordemdecompra ?? ''),
    contrato,
    cliente:   String(r.cliente  ?? ''),
    ambiente:  String(r.ambiente ?? ''),
    entrega:   toDateInput(r.dataentrega),
    total:     Number(r.total     ?? 0),
    atrasados: Number(r.atrasados ?? 0),
    recebidos: Number(r.recebidos ?? 0),
    itens:     [],
  }))
}

export async function updatePendingItem(item: PendingItem): Promise<void> {
  await apiPut('/pendencias/acessorios', {
    id:           item.id,
    id_categoria: item.categoriaId || null,
    descricao:    item.descricao,
    medida:       item.medida      || null,
    parcelamento: null,
    numcard:      null,
    qtd:          item.qtd,
    fornecedor:   item.fornecedor  || null,
    datacompra:   item.compra      || null,
    previsao:     item.previsao    || null,
    recebido:     item.recebido    || null,
  })
}

export async function deletePendingItem(id: number): Promise<void> {
  await apiPost('/pendencias/del-acessorio', { id })
}

export async function insertPendingItem(
  ordemdecompra: number,
  item: PendingItem,
): Promise<void> {
  await apiPost('/pendencias/acessorios', {
    ordemdecompra,
    id_categoria:  item.categoriaId,
    descricao:     item.descricao,
    medida:        item.medida   || null,
    quantidade:    item.qtd,
    fornecedor:    item.fornecedor || null,
    compra:        item.compra   || null,
    previsao:      item.previsao || null,
    recebido:      item.recebido || null,
  })
}
