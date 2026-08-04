import { apiGet, apiPost } from '../../services/api';
import { toDatetimeLocal } from '../../utils/dateUtils';
import { STAGE_ORDER } from './types';
import type { ApontamentoProject, Stage, StageId, StageStatus, Operator } from './types';

const STAGE_LABELS: Record<StageId, string> = {
  corte:        'Corte',
  customizacao: 'Customização',
  coladeira:    'Coladeira',
  usinagem:     'Usinagem',
  paineis:      'Painéis',
  montagem:     'Montagem',
  acabamento:   'Acabamento',
  embalagem:    'Embalagem',
};

type ApiRow = Record<string, unknown>;

function deriveStatus(inicio: string | null, fim: string | null, pausa: boolean): StageStatus {
  if (fim)    return 'finalizado';
  if (inicio) return pausa ? 'pausado' : 'em_andamento';
  return 'nao_iniciado';
}

function mapRow(row: ApiRow, pedido: number): ApontamentoProject {
  const etapas = {} as Record<StageId, Stage>;

  STAGE_ORDER.forEach((id, idx) => {
    const inicio = (row[`${id}inicio`] as string | null) ?? null;
    const fim    = (row[`${id}fim`]    as string | null) ?? null;
    const pausa  = Boolean(row[`${id}pausa`]);
    const resp   = row[`${id}resp`];
    const name   = row[`${id}name`];

    etapas[id] = {
      id,
      label:           STAGE_LABELS[id],
      order:           idx + 1,
      status:          deriveStatus(inicio, fim, pausa),
      inicio,
      fim,
      pausa,
      responsavelId:   resp != null ? String(resp) : null,
      responsavelNome: name != null ? String(name) : null,
    };
  });

  return {
    ordemdecompra: Number(row.ordemdecompra),
    pedido:        pedido,
    contrato:      String(row.contrato  ?? ''),
    cliente:       String(row.cliente   ?? ''),
    ambiente:      String(row.ambiente  ?? ''),
    codcc:         String(row.codcc     ?? ''),
    numproj:       String(row.numproj   ?? ''),
    lote:          String(row.lote      ?? ''),
    chegoufabrica: (row.chegoufabrica as string | null) ?? null,
    dataentrega:   (row.dataentrega   as string | null) ?? null,
    previsao:      (row.previsao      as string | null) ?? null,
    iniciado:      null,
    pronto:        null,
    observacoes:   (row.observacoes   as string | null) ?? null,
    status:        'aguardando',
    etapas,
    materiais:     [],
  };
}

export async function fetchProjectByPedido(pedido: string): Promise<ApontamentoProject[] | null> {
  const rows = await apiGet<ApiRow[]>('/apontamento/pedido', { p_pedido: pedido });
  if (!rows.length) return null;
  const num = parseInt(pedido, 10);
  return rows.map(r => mapRow(r, num));
}

export async function fetchApontamentoOperators(): Promise<Operator[]> {
  const rows = await apiGet<{ id: unknown; nome: unknown }[]>('/utils/operadores');
  return rows
    .map(r => ({ id: String(r.id ?? ''), nome: String(r.nome ?? '') }))
    .filter(r => Number(r.id) > 0);
}

export async function saveApontamento(project: ApontamentoProject): Promise<void> {
  const payload: Record<string, unknown> = {
    p_ordemdecompra: project.ordemdecompra,
    p_previsao:      project.previsao    ?? null,
    p_observacoes:   project.observacoes ?? null,
  };

  for (const id of STAGE_ORDER) {
    const s = project.etapas[id];
    payload[`p_${id}inicio`] = toDatetimeLocal(s.inicio) || null;
    payload[`p_${id}fim`]    = toDatetimeLocal(s.fim)    || null;
    payload[`p_${id}resp`]   = s.responsavelId != null ? Number(s.responsavelId) : null;
    payload[`p_${id}pausa`]  = s.pausa;
  }

  await apiPost('/apontamento/dados', payload);
}
