import { apiGet, apiPost } from './api'
import { toDateInput } from '../utils/dateUtils'
import type { SelectOption } from '../components/Select'

type RawRow = Record<string, unknown>

export interface Category {
  id: number;
  nome: string;
}

export async function fetchCategories(): Promise<Category[]> {
  const rows = await apiGet<RawRow[]>('/utils/categorias')
  return rows.map((r) => ({
    id:   Number(r.id),
    nome: String(r.categoria ?? ''),
  }))
}

export async function fetchConfigDate(id: number): Promise<string> {
  const rows = await apiGet<RawRow[]>('/utils/table-data', { p_id: id })
  const raw = Array.isArray(rows) ? rows[0] : null
  return toDateInput(raw?.data)
}

export async function saveConfigDate(id: number, date: string): Promise<void> {
  await apiPost('/utils/data', { p_id: id, p_date: date })
}

export async function fetchLiberadores(): Promise<SelectOption[]> {
  const rows = await apiGet<RawRow[]>('/utils/liberadores')
  return rows.map((r) => ({
    value: r.id as number,
    label: r.liberador as string,
  }))
}

export async function fetchVendedores(): Promise<SelectOption[]> {
  const rows = await apiGet<RawRow[]>('/utils/vendedores')
  return rows.map((r) => ({
    value: r.id as number,
    label: r.vendedor as string,
  }))
}

export async function fetchLojas(): Promise<SelectOption[]> {
  const rows = await apiGet<RawRow[]>('/utils/lojas')
  return rows.map((r) => ({
    value: r.id as number,
    label: r.loja as string,
  }))
}

export async function fetchEtapas(): Promise<SelectOption[]> {
  const rows = await apiGet<RawRow[]>('/utils/etapas')
  return rows.map((r) => ({
    value: r.id as number,
    label: r.etapa as string,
  }))
}

export async function fetchTiposCliente(): Promise<SelectOption[]> {
  const rows = await apiGet<RawRow[]>('/projetos/tipos-cliente')
  return rows.map((r) => ({
    value: r.id as number,
    label: r.tipocliente as string,
  }))
}

export async function fetchTiposContrato(): Promise<SelectOption[]> {
  const rows = await apiGet<RawRow[]>('/utils/tipo-contrato')
  return rows.map((r) => ({
    value: r.id as number,
    label: r.tipocontrato as string,
  }))
}

export async function fetchTiposAmbiente(): Promise<SelectOption[]> {
  const rows = await apiGet<RawRow[]>('/utils/ambientes')
  return rows.map((r) => ({
    value: r.id as number,
    label: r.tipo_ambiente as string,
  }))
}
