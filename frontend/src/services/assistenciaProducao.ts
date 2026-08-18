import { apiGet, apiPost } from './api';
import { fmtDateTime } from '../utils/dateUtils';
import type { AssistanceProduction, AssistanceStatus } from '../types/assistenciaProducao';

type RawRow = Record<string, unknown>;

function isoToBR(val: unknown): string {
  if (!val) return '';
  const s = String(val).split('T')[0];
  const [y, m, d] = s.split('-');
  return `${d}/${m}/${y}`;
}

function fmtPrazo(days: number): string {
  if (days < 0) return `Atrasado ${Math.abs(days)}d`;
  if (days === 0) return 'Hoje';
  return `${days} dia${days !== 1 ? 's' : ''}`;
}

const fmtTimestamp = fmtDateTime;

function toAssistencia(r: RawRow, index: number): AssistanceProduction {
  const prazoDias = r.prazo !== null && r.prazo !== undefined
    ? Number(r.prazo)
    : null;

  return {
    id:             String(r.solicitacao ?? ''),
    num:            index + 1,
    numSolicitacao: String(r.solicitacao ?? ''),
    numContrato:    String(r.contrato    ?? ''),
    corte:          String(r.corte       ?? ''),
    pedido:         '',
    cliente:        String(r.cliente     ?? ''),
    ambiente:       String(r.ambiente    ?? ''),
    solicitante:    '',
    dataHora:       fmtTimestamp(r.datasolicitacao as string | null),
    prazoDias,
    prazo:          prazoDias !== null ? fmtPrazo(prazoDias) : '—',
    status:         (String(r.status ?? 'EM ABERTO')) as AssistanceStatus,
    urgente:        String(r.urgente ?? 'nao').toLowerCase(),
    iniciado:       isoToBR(r.iniciado),
    previsao:       isoToBR(r.previsao),
    pronto:         isoToBR(r.pronto),
    entregue:       isoToBR(r.dataentrega),
    supervisor:     '',
    liberador:      '',
    conferente:     '',
    despachante:    '',
    motorista:      '',
    flagEscritorio:  false,
    flagProducao:    false,
    flagSemMaterial: false,
    flagPendencia:   false,
    obsFactory:     '',
    obsLogistics:   '',
    equipe:         [],
  };
}

export async function fetchAssistencias(data: string): Promise<AssistanceProduction[]> {
  const rows = await apiGet<RawRow[]>('/assistencias/', { data });
  return rows.map(toAssistencia);
}

function toAssistenciaDetail(r: RawRow): AssistanceProduction {
  return {
    id:             String(r.solicitacao ?? ''),
    num:            0,
    numSolicitacao: String(r.solicitacao ?? ''),
    numContrato:    String(r.contrato    ?? ''),
    corte:          String(r.corte       ?? ''),
    pedido:         String(r.pedido      ?? ''),
    cliente:        String(r.cliente     ?? ''),
    ambiente:       String(r.ambiente    ?? ''),
    solicitante:    String(r.solicitante ?? ''),
    dataHora:       fmtTimestamp(r.datasolicitacao as string | null),
    prazoDias:      null,
    prazo:          '—',
    status:         (String(r.situacao   ?? 'EM ABERTO')) as AssistanceStatus,
    urgente:        String(r.urgente     ?? 'nao').toLowerCase(),
    iniciado:       isoToBR(r.iniciado),
    previsao:       isoToBR(r.previsao),
    pronto:         isoToBR(r.pronto),
    entregue:       isoToBR(r.dataentrega),
    supervisor:     String(r.supervisor  ?? ''),
    liberador:      String(r.liberador   ?? ''),
    conferente:     String(r.conferente  ?? ''),
    despachante:    String(r.liberacao   ?? ''),
    motorista:      String(r.responsavel ?? ''),
    flagEscritorio:  Boolean(r.escritorio),
    flagProducao:    Boolean(r.producao),
    flagSemMaterial: Boolean(r.sem_material),
    flagPendencia:   Boolean(r.pendencia),
    obsFactory:     String(r.observacao  ?? ''),
    obsLogistics:   String(r.observacao2 ?? ''),
    equipe:         [],
  };
}

export async function fetchAssistanciaDetail(solicitacao: string): Promise<AssistanceProduction> {
  const [rows, equipeRaw] = await Promise.all([
    apiGet<RawRow[]>('/assistencias/projeto', { solicitacao }),
    apiGet<RawRow[]>('/utils/equip-sat', { id_sat: solicitacao }),
  ]);
  if (!rows.length) throw new Error('Assistência não encontrada');
  const detail = toAssistenciaDetail(rows[0]);
  detail.equipe = equipeRaw.map(r => ({ id: Number(r.id), nome: String(r.name ?? '') }));
  return detail;
}

function brToISO(val: string): string | null {
  if (!val || val === '—') return null;
  const [d, m, y] = val.split('/');
  if (!d || !m || !y) return null;
  return `${y}-${m}-${d}`;
}

export async function saveAssistencia(data: AssistanceProduction): Promise<void> {
  await apiPost('/assistencias/', {
    solicitacao:  data.id,
    pedido:       data.pedido !== '' ? Number(data.pedido) : null,
    corte:        data.corte  !== '' ? Number(data.corte)  : null,
    observacao:   data.obsFactory,
    observacao2:  data.obsLogistics,
    iniciado:     brToISO(data.iniciado),
    pronto:       brToISO(data.pronto),
    previsao:     brToISO(data.previsao),
    conferente:   data.conferente,
    responsavel:  data.motorista,
    escritorio:   data.flagEscritorio,
    producao:     data.flagProducao,
    sem_material: data.flagSemMaterial,
    pendencia:    data.flagPendencia,
    liberacao:    data.despachante,
    dataentrega:  brToISO(data.entregue),
  });
}
