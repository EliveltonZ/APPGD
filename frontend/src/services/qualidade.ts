import { apiGet, apiPost } from './api';
import type { QualityItem } from '../types/qualityControl';
import { OCCURRENCE_OPTIONS } from '../data/qualityControlConfig';

export function saveQualityAnalysis(item: {
  id: string;
  idErp: string;
  falha: string;
  causa: string;
  causaRaiz: string;
}): Promise<unknown> {
  return apiPost('/qualidade/causa', {
    id:      Number(item.id),
    id_erp:  Number(item.idErp) || null,
    falha:   Number(item.falha)  || null,
    causa:   Number(item.causa)  || null,
    analise: item.causaRaiz,
  });
}

export async function fetchCausaFalha(
  falhaId: number,
): Promise<Array<{ value: string; label: string }>> {
  type Row = Record<string, unknown>;
  const rows = await apiGet<Row[]>('/utils/causa-falha', { id_falha: falhaId });
  return rows.map((r) => ({
    value: String(r.id       ?? ''),
    label: String(r.descricao ?? ''),
  }));
}

type RawRow = Record<string, unknown>;

const OCCURRENCE_MAP = Object.fromEntries(OCCURRENCE_OPTIONS.map((o, i) => [i + 1, o.value]));

export async function fetchQualityItems(): Promise<QualityItem[]> {
  const rows = await apiGet<RawRow[]>('/qualidade/');
  return rows.map((r) => {
    const analise = String(r.analise ?? '');
    return {
      id:            String(r.id          ?? ''),
      codigo:        String(r.id          ?? ''),
      idAssistencia: String(r.id_assistencia ?? ''),
      pedido:        String(r.pedido      ?? ''),
      idErp:         String(r.id_erp      ?? ''),
      qtd:           Number(r.qtd         ?? 0),
      cor:           String(r.cor         ?? ''),
      peca:          String(r.peca        ?? ''),
      dimensoes:     String(r.dimensoes   ?? ''),
      orientacao:    String(r.orientacao  ?? ''),
      cliente:       String(r.cliente     ?? ''),
      ambiente:      String(r.ambiente    ?? ''),
      supervisor:    String(r.supervisor  ?? ''),
      observacoes:   String(r.observacoes ?? ''),
      ocorrencia:    (OCCURRENCE_MAP[Number(r.ocorrencia)] ?? '') as QualityItem['ocorrencia'],
      falha:         String(r.falha       ?? ''),
      causa:         String(r.causa       ?? ''),
      causaRaiz:     analise,
      status:        analise.trim() ? 'analisado' : 'pendente',
    };
  });
}
