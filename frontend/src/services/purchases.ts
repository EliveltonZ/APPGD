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
    id:           p.id,
    descricao:    p.descricao,
    medida:       p.medida,
    parcelamento: p.parcelas   || null,
    numcard:      p.cartao     || null,
    qtd:          p.qtd,
    fornecedor:   p.fornecedor || null,
    datacompra:   p.compra     || null,
    previsao:     p.previsao   || null,
    recebido:     p.recebido   || null,
  })
}

export async function fetchPurchases(dataentrega = '1970-01-01'): Promise<Purchase[]> {
  const rows = await apiGet<RawRow[]>('/compras', { dataentrega })
  return rows.map(toPurchase)
}
