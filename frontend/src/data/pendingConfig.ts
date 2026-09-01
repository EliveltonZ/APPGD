import type { PendingStatus, PendingItem } from '../types/pending';
import { localDateStr } from '../utils/dateUtils';

export const PEND_STATUS_LABELS: Record<PendingStatus, string> = {
  pendente:  'Pendente',
  comprado:  'Comprado',
  atrasado:  'Atrasado',
  recebido:  'Recebido',
};

export function computeItemStatus(item: PendingItem): PendingStatus {
  const today = localDateStr();
  if (item.recebido) return 'recebido';
  if (item.previsao && item.previsao < today) return 'atrasado';
  if (item.compra) return 'comprado';
  return 'pendente';
}

export function emptyPendingItem(id = 0): PendingItem {
  return {
    id,
    categoriaId: 1,
    categoria:   '',
    descricao:   '',
    medida:      '',
    qtd:         1,
    fornecedor:  '',
    compra:      '',
    previsao:    '',
    recebido:    '',
  };
}
