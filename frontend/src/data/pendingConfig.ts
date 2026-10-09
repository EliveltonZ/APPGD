import type { PendingStatus } from '../types/pending';

export const PEND_STATUS_LABELS: Record<PendingStatus, string> = {
  PENDENTE:  'Pendente',
  RESERVADO: 'Reservado',
  EXECUTADO: 'Executado',
  CANCELADO: 'Cancelado',
};
