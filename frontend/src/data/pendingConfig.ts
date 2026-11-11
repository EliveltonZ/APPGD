import type { PendingStatus } from '../types/pending';

export const PEND_STATUS_LABELS: Record<PendingStatus, string> = {
  PENDENTE:  'Pendente',
  LIBERADO:  'Liberado',
  EXECUTADO: 'Executado',
  CANCELADO: 'Cancelado',
};
