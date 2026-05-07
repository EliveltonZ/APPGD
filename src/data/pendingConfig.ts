import type { PendingStatus, PendingCategory, PendingItem } from '../types/pending';

export const PEND_STATUS_LABELS: Record<PendingStatus, string> = {
  pendente:  'Pendente',
  comprado:  'Comprado',
  atrasado:  'Atrasado',
  recebido:  'Recebido',
};

export const PEND_CATEGORY_LABELS: Record<PendingCategory, string> = {
  ferragens:  'Ferragens',
  madeira:    'Madeira',
  acabamento: 'Acabamento',
  vidro:      'Vidro',
  eletrico:   'Elétrico',
  outros:     'Outros',
};

export const ALL_PEND_CATEGORIES: PendingCategory[] = [
  'ferragens', 'madeira', 'acabamento', 'vidro', 'eletrico', 'outros',
];

export const ALL_PEND_STATUSES: PendingStatus[] = [
  'pendente', 'comprado', 'atrasado', 'recebido',
];

export function computeItemStatus(item: PendingItem): PendingStatus {
  const today = new Date().toISOString().split('T')[0];
  if (item.recebido) return 'recebido';
  if (item.previsao && item.previsao < today) return 'atrasado';
  if (item.compra) return 'comprado';
  return 'pendente';
}

export function emptyPendingItem(id = 0): PendingItem {
  return {
    id,
    categoria: 'outros',
    descricao: '',
    medida: '',
    qtd: 1,
    fornecedor: '',
    compra: '',
    previsao: '',
    recebido: '',
  };
}
