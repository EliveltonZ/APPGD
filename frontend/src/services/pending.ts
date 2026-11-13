import { apiGet, apiPost, apiDelete } from './api'
import { toDateInput, fmtDate } from '../utils/dateUtils'
import type { PendingItem, PendingProject } from '../types/pending'
import type { AcessorioRow } from '../components/AcessoriosTable'

type RawRow = Record<string, unknown>

export async function fetchPendingItems(
  ordemdecompra: number,
): Promise<PendingItem[]> {
  const rows = await apiGet<RawRow[]>(`/estoque/pedido/${ordemdecompra}/itens`)
  return rows.map((r) => ({
    id:            Number(r.id),
    materialId:    Number(r.materialId),
    codigoInterno: r.codigoInterno != null ? String(r.codigoInterno) : null,
    descricao:     r.descricao     != null ? String(r.descricao)     : null,
    unidade:       String(r.unidade ?? ''),
    tipo:          (r.tipo as PendingItem['tipo']) ?? 'FERRAGEM',
    quantidade:    Number(r.quantidade ?? 0),
    qtdUnConfirmada: r.qtdUnConfirmada != null ? Number(r.qtdUnConfirmada) : null,
    detalhes:      r.detalhes != null ? String(r.detalhes) : null,
    origem:        (r.origem as PendingItem['origem']) ?? 'MANUAL',
    status:        (r.status as PendingItem['status']) ?? 'PENDENTE',
  }))
}

export async function fetchPendingByContract(
  contrato: string,
): Promise<PendingProject[]> {
  const rows = await apiGet<RawRow[]>('/estoque/pedido/buscar-contrato', { contrato })
  return rows.map((r) => ({
    id:        Number(r.ordemdecompra),
    numOC:     String(r.ordemdecompra ?? ''),
    contrato,
    cliente:   String(r.cliente  ?? ''),
    ambiente:  String(r.ambiente ?? ''),
    entrega:   toDateInput(r.dataentrega),
    lote:      r.lote != null ? Number(r.lote) : null,
    total:     Number(r.total ?? 0),
    itens:     [],
  }))
}

export async function insertPendingItem(
  ordemdecompra: number,
  item: { materialId: number; quantidade: number; detalhes: string | null },
): Promise<void> {
  await apiPost(`/estoque/pedido/${ordemdecompra}/itens`, {
    material_id: item.materialId,
    quantidade:  item.quantidade,
    detalhes:    item.detalhes,
  })
}

export async function deletePendingItem(id: number): Promise<void> {
  await apiDelete(`/estoque/pedido/itens/${id}`)
}

// Fonte antiga (tblAcessorios, via /pendencias/acessorios) — mantida em
// paralelo ao fluxo novo de Itens Pedido (tblXmlConsumo) porque é a única
// que ainda rastreia data de compra/previsão/recebimento.
export async function fetchAccessoryPurchases(
  ordemdecompra: number,
): Promise<AcessorioRow[]> {
  const rows = await apiGet<RawRow[]>('/pendencias/acessorios', { ordemdecompra })
  return rows.map((r) => ({
    id:        String(r.id),
    descricao: String(r.descricao ?? ''),
    medida:    String(r.medida ?? ''),
    qtd:       Number(r.qtd ?? 0),
    compra:    fmtDate(r.datacompra as string | null),
    previsao:  fmtDate(r.previsao as string | null),
    recebido:  fmtDate(r.recebido as string | null),
  }))
}
