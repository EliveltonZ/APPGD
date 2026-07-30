import { apiGet, apiPost, apiPut, apiDelete } from './api'

export interface CadastroRow {
  id: number
  label: string
  password?: string | null
}

export async function listCadastro(entity: string): Promise<CadastroRow[]> {
  return apiGet<CadastroRow[]>(`/cadastros/${entity}`)
}

export async function createCadastro(entity: string, data: Omit<CadastroRow, 'id'>): Promise<CadastroRow> {
  return apiPost<CadastroRow>(`/cadastros/${entity}`, data)
}

export async function updateCadastro(entity: string, id: number, data: Omit<CadastroRow, 'id'>): Promise<CadastroRow> {
  return apiPut<CadastroRow>(`/cadastros/${entity}/${id}`, data)
}

export async function deleteCadastro(entity: string, id: number): Promise<void> {
  return apiDelete(`/cadastros/${entity}/${id}`)
}
