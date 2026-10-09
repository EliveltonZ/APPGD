import { apiGet, apiPost, apiPut } from './api'
import type { PendingItem } from '../types/pending'

export interface Saldo {
  fisico: number
  reservado: number
  comprado: number
  solicitado: number
  disponivel: number
  saldoBloqueio: number
  saldoVisibilidade: number
}

export const fetchSaldo = (materialId: number): Promise<Saldo> =>
  apiGet(`/estoque/saldo/${materialId}`)

export const definirQuantidade = (id: number, qtdUnConfirmada: number) =>
  apiPut(`/estoque/${id}/quantidade`, { qtd_un_confirmada: qtdUnConfirmada })

export const reservar = (id: number) =>
  apiPost(`/estoque/${id}/reservar`, {})

export const liberarReserva = (id: number) =>
  apiPost(`/estoque/${id}/liberar-reserva`, {})

export const darBaixa = (
  id: number,
  payload: { qtdUnBaixada: number; localizacaoId: number },
) =>
  apiPost(`/estoque/${id}/baixa`, {
    qtd_un_baixada: payload.qtdUnBaixada,
    localizacao_id: payload.localizacaoId,
  })

export interface ReservaResultado {
  id: number
  ordemdecompra: number
  ok: boolean
  erro?: string
}

export interface ReservaLoteResumo {
  lote: number
  totalPedidos: number
  totalItens: number
  resultados: ReservaResultado[]
}

export interface ReservaPedidoResumo {
  totalItens: number
  resultados: ReservaResultado[]
}

export const reservarPedido = (ordemdecompra: number): Promise<ReservaPedidoResumo> =>
  apiPost(`/estoque/pedido/${ordemdecompra}/reservar-tudo`, {})

export const reservarLote = (ordemdecompra: number): Promise<ReservaLoteResumo> =>
  apiPost(`/estoque/pedido/${ordemdecompra}/reservar-lote`, {})

// Fila do almoxarifado — tudo que já pode ser baixado agora, cruzando
// pedidos diferentes (RESERVADO de qualquer material, ou PENDENTE de
// material sem controle de estoque mínimo, que pula a reserva).
export interface EstoquePendenteItem extends PendingItem {
  ordemdecompra: number
  contrato: string
  ambiente: string
  cliente: string | null
}

export const fetchProntoParaBaixa = (): Promise<EstoquePendenteItem[]> =>
  apiGet('/estoque/pronto-para-baixa')

// Saldo real por material — "o que eu tenho em estoque", não fila de ação.
export interface SaldoMaterial {
  id: number
  codigoInterno: string
  descricao: string
  unidadeBase: string
  estoqueMinimoUn: number | null
  fisico: number
  reservado: number
  disponivel: number
  comprado: number
  solicitado: number
  saldoBloqueio: number
  saldoVisibilidade: number
}

export const fetchSaldoPorMaterial = (): Promise<SaldoMaterial[]> =>
  apiGet('/estoque/saldo-materiais')
