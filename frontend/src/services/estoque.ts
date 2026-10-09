import { apiGet, apiPost, apiPut } from './api'

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
