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
    p_ordemdecompra: ordemdecompra,
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
  const rows = await apiGet<RawRow[]>('/pendencias/contrato', { p_contrato: contrato })
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
    p_id:           item.id,
    p_id_categoria: item.categoriaId || null,
    p_descricao:    item.descricao,
    p_medida:       item.medida      || null,
    p_parcelamento: null,
    p_numcard:      null,
    p_qtd:          item.qtd,
    p_fornecedor:   item.fornecedor  || null,
    p_datacompra:   item.compra      || null,
    p_previsao:     item.previsao    || null,
    p_recebido:     item.recebido    || null,
  })
}

export async function deletePendingItem(id: number): Promise<void> {
  await apiPost('/pendencias/del-acessorio', { p_id: id })
}

export async function insertPendingItem(
  ordemdecompra: number,
  item: PendingItem,
): Promise<void> {
  await apiPost('/pendencias/acessorios', {
    p_ordemdecompra: ordemdecompra,
    p_id_categoria:  item.categoriaId,
    p_descricao:     item.descricao,
    p_medida:        item.medida   || null,
    p_quantidade:    item.qtd,
    p_fornecedor:    item.fornecedor || null,
    p_compra:        item.compra   || null,
    p_previsao:      item.previsao || null,
    p_recebido:      item.recebido || null,
  })
}
