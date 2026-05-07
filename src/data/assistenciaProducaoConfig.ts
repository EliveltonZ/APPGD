import type { AssistanceStatus } from '../types/assistenciaProducao';

export const ASSISTANCE_STATUS_LABELS: Record<AssistanceStatus, string> = {
  em_aberto:    'Em Aberto',
  escritorio:   'Escritório',
  producao:     'Produção',
  iniciado:     'Iniciado',
  pronto:       'Pronto',
  sem_material: 'Sem Material',
  pendencia:    'Pendência',
  entregue:     'Entregue',
};

export const ASSISTANCE_STATUS_OPTIONS = [
  { value: 'all',          label: 'Todos os Status' },
  { value: 'em_aberto',    label: 'Em Aberto'       },
  { value: 'escritorio',   label: 'Escritório'      },
  { value: 'producao',     label: 'Produção'        },
  { value: 'iniciado',     label: 'Iniciado'        },
  { value: 'pronto',       label: 'Pronto'          },
  { value: 'sem_material', label: 'Sem Material'    },
  { value: 'pendencia',    label: 'Pendência'       },
  { value: 'entregue',     label: 'Entregue'        },
];

export const AP_URGENTE_FILTER_OPTIONS = [
  { value: 'all', label: 'Todos'   },
  { value: 'sim', label: 'Urgente' },
  { value: 'nao', label: 'Normal'  },
];

export const AP_STATUS_EDIT_OPTIONS = [
  { value: 'em_aberto',    label: 'Em Aberto'    },
  { value: 'escritorio',   label: 'Escritório'   },
  { value: 'producao',     label: 'Produção'     },
  { value: 'iniciado',     label: 'Iniciado'     },
  { value: 'pronto',       label: 'Pronto'       },
  { value: 'sem_material', label: 'Sem Material' },
  { value: 'pendencia',    label: 'Pendência'    },
  { value: 'entregue',     label: 'Entregue'     },
];