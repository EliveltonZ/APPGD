import type { AccessoryLaunchStatus, AccessoryLaunchItem } from '../types/accessoryLaunch';
import { localDateStr } from '../utils/dateUtils';

export const ACC_LAUNCH_STATUS_LABELS: Record<AccessoryLaunchStatus, string> = {
  pendente: 'Pendente',
  comprado: 'Comprado',
  atrasado: 'Atrasado',
  recebido: 'Recebido',
};

export function computeAccessoryLaunchStatus(item: AccessoryLaunchItem): AccessoryLaunchStatus {
  const today = localDateStr();
  if (item.recebido) return 'recebido';
  if (item.previsao && item.previsao < today) return 'atrasado';
  if (item.compra) return 'comprado';
  return 'pendente';
}

export function emptyAccessoryLaunchItem(id = 0): AccessoryLaunchItem {
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
