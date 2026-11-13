import { apiGet } from './api';

type RawRow = Record<string, unknown>;

export interface SolicitacaoTipo {
  cod:   number;
  label: string;
}

export async function fetchSolicitacaoConfig(): Promise<SolicitacaoTipo[]> {
  const rows = await apiGet<RawRow[]>('/solicitacao/config');
  return rows.map(r => ({
    cod:   Number(r.cod),
    label: String(r.descricao ?? ''),
  }));
}

export interface FalhaConfig {
  id:    number;
  label: string;
}

export interface OcorrenciaConfig {
  id:    number;
  label: string;
}

export async function fetchFalhasConfig(): Promise<FalhaConfig[]> {
  const rows = await apiGet<RawRow[]>('/solicitacao/falhas');
  return rows.map(r => ({ id: Number(r.codigo), label: String(r.descricao ?? '') }));
}

export async function fetchMontadores(): Promise<{ id: number; nome: string }[]> {
  const rows = await apiGet<RawRow[]>('/solicitacao/montadores');
  return rows.map(r => ({
    id:   Number(r.codigo),
    nome: String(r.nome ?? ''),
  }));
}

export async function fetchOcorrenciasConfig(): Promise<OcorrenciaConfig[]> {
  const rows = await apiGet<RawRow[]>('/solicitacao/ocorrencias');
  return rows.map(r => ({ id: Number(r.cod), label: String(r.descricao ?? '') }));
}
