import { apiGet } from './api';
import type { ProjectValue } from '../types/financeiro';
import { getMarginStatus } from '../utils/financeiroUtils';

type RawRow = Record<string, unknown>;

export async function fetchProjectValues(dataInicial: string, dataFinal: string): Promise<ProjectValue[]> {
  const rows = await apiGet<RawRow[]>('/valores/', { dataInicial, dataFinal });
  return rows.map((r) => {
    const margem = Number(r.margem ?? 0);
    return {
      id:            Number(r.ordemdecompra ?? 0),
      numOC:         String(r.ordemdecompra ?? ''),
      contrato:      String(r.contrato      ?? ''),
      cliente:       String(r.cliente       ?? ''),
      np:            String(r.numproj       ?? ''),
      pedido:        r.pedido ? String(r.pedido) : '',
      ambiente:      String(r.ambiente      ?? ''),
      chegouFabrica: String(r.chegoufabrica ?? '').split('T')[0],
      data:          String(r.dataentrega   ?? '').split('T')[0],
      bruto:         Number(r.valorbruto    ?? 0),
      negociado:     Number(r.valornegociado ?? 0),
      material:      Number(r.customaterial  ?? 0),
      descPct:       Number(r.desconto      ?? 0),
      lucroBruto:    Number(r.lucrobruto    ?? 0),
      margem,
      marginStatus:  getMarginStatus(margem),
    };
  });
}
