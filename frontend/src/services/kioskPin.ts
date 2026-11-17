import { apiGet, apiPost } from './api'

export interface KioskPinInfo {
  pin: string
  atualizadoEm: string
}

export async function fetchKioskPin(): Promise<KioskPinInfo | null> {
  return apiGet<KioskPinInfo | null>('/kiosk-pin')
}

export async function gerarKioskPin(): Promise<KioskPinInfo> {
  return apiPost<KioskPinInfo>('/kiosk-pin/gerar', {})
}
