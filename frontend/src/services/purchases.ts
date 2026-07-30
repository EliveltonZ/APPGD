import { apiGet, apiPost } from './api'
import { toDateInput } from '../utils/dateUtils'
import { fetchConfigDate } from './utils'
import type { Purchase } from '../types/purchases'

type RawRow = Record<string, unknown>

function toPurchase(r: RawRow): Purchase {
  return {
    id:            Number(r.id),
    ordemdecompra: Number(r.ordemdecompra),
    contrato:      Number(r.contrato),
    cliente:       String(r.cliente    ?? ''),
    ambiente:      String(r.ambiente   ?? ''),
    descricao:     String(r.descricao  ?? ''),
    categoria:     String(r.categoria  ?? ''),
    medida:        String(r.medida     ?? ''),
    qtd:           Number(r.qtd),
    parcelas:      Number(r.parcelamento),
    cartao:        String(r.numcard    ?? ''),
    fornecedor:    String(r.fornecedor ?? ''),
    chegoufabrica: toDateInput(r.chegoufabrica),
    entrega:       toDateInput(r.dataentrega),
    compra:        toDateInput(r.datacompra),
    previsao:      toDateInput(r.previsao),
    recebido:      toDateInput(r.recebido),
    status:        String(r.status ?? 'AGUARDANDO') as Purchase['status'],
    observacoes:   '',
  }
}

export function fetchPurchaseFilterDate(): Promise<string> {
  return fetchConfigDate(3)
}

export async function savePurchase(p: Purchase): Promise<void> {
  await apiPost('/compras', {
    p_id:           p.id,
    p_descricao:    p.descricao,
    p_medida:       p.medida,
    p_parcelamento: p.parcelas   || null,
    p_numcard:      p.cartao     || null,
    p_qtd:          p.qtd,
    p_fornecedor:   p.fornecedor || null,
    p_datacompra:   p.compra     || null,
    p_previsao:     p.previsao   || null,
    p_recebido:     p.recebido   || null,
  })
}

export async function fetchPurchases(dataentrega = '1970-01-01'): Promise<Purchase[]> {
  const rows = await apiGet<RawRow[]>('/compras', { p_dataentrega: dataentrega })
  return rows.map(toPurchase)
}
