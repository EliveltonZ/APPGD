import { apiGet, apiPost } from './api';
import type { ServicePart } from '../types/assistencia';

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

export async function fetchContratoAssist(
  contrato: number,
): Promise<{ cliente: string; liberador: string } | null> {
  try {
    const rows = await apiGet<RawRow[]>('/solicitacao/contrato', { p_contrato: contrato });
    const r    = Array.isArray(rows) ? rows[0] : null;
    if (!r) return null;
    return { cliente: String(r.cliente ?? ''), liberador: String(r.liberador ?? '') };
  } catch {
    return null;
  }
}

interface SolicitacaoBody {
  numContrato:     string;
  solicitante:     string;
  cliente:         string;
  ambiente:        string;
  urgente:         string;
  montador:        string;
  bairro:          string;
  tempo:           string;
  tipoSolicitacao: string;
  origemMontagem:  boolean;
  origemPromob:    boolean;
  origemEntrega:   boolean;
  origemCobrada:   boolean;
  supervisor:      string;
  destino:         string;
  observacoes:     string;
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

export async function submitSolicitacaoCompleta(
  numSolicitacao: string,
  dataHoraISO:    string,
  form:           SolicitacaoBody,
  parts:          ServicePart[],
  equipe:         { id: number }[],
): Promise<string> {
  const up = (s: string) => s.toUpperCase();

  const result = await apiPost<[{ solicitacao: string }]>('/assistencias/completa', {
    solicitacao:     numSolicitacao,
    contrato:        Number(form.numContrato),
    solicitante:     up(form.solicitante),
    datasolicitacao: dataHoraISO,
    cliente:         up(form.cliente),
    ambiente:        up(form.ambiente),
    urgente:         up(form.urgente),
    montador:        up(form.montador),
    bairro:          up(form.bairro),
    tempo:           up(form.tempo),
    tipoassistencia: Number(form.tipoSolicitacao),
    montagem:        form.origemMontagem,
    promob:          form.origemPromob,
    entrega:         form.origemEntrega,
    supervisor:      up(form.supervisor),
    destino:         form.destino,
    cobrada:         form.origemCobrada,
    observacoes:     up(form.observacoes),
    pecas: parts.map(p => ({
      qtd:           p.qtd,
      cor:           p.cor,
      peca:          p.peca,
      dimensoes:     p.dimensoes,
      lado:          p.lado,
      id_ocorrencia: p.ocorrenciaId,
      observacoes:   p.observacoes,
      id_falha:      p.falhaId,
    })),
    equipe: equipe.map(m => ({ id: m.id })),
  });
  return result[0].solicitacao;
}
