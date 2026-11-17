import { apiGet, apiPost } from './api'

export type CoresSetor = Record<string, string>

export async function fetchCoresSetor(): Promise<CoresSetor> {
  return apiGet<CoresSetor>('/cor-setor')
}

export async function salvarCorSetor(setor: string, cor: string): Promise<void> {
  await apiPost('/cor-setor', { setor, cor })
}
