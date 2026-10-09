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
