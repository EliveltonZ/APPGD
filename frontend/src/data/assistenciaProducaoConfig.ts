import type { AssistanceStatus } from '../types/assistenciaProducao';

export const ASSISTANCE_STATUS_LABELS: Record<AssistanceStatus, string> = {
  'EM ABERTO':    'Em Aberto',
  'ESCRITORIO':   'Escritório',
  'PRODUCAO':     'Produção',
  'IMPRESSO':     'Impresso',
  'INICIADO':     'Iniciado',
  'PRONTO':       'Pronto',
  'SEM MATERIAL': 'Sem Material',
  'PENDENCIA':    'Pendência',
  'ENTREGUE':     'Entregue',
};

export const ASSISTANCE_STATUS_OPTIONS = [
  { value: 'all',          label: 'Todos os Status' },
  { value: 'EM ABERTO',    label: 'Em Aberto'       },
  { value: 'ESCRITORIO',   label: 'Escritório'      },
  { value: 'PRODUCAO',     label: 'Produção'        },
  { value: 'IMPRESSO',     label: 'Impresso'        },
  { value: 'INICIADO',     label: 'Iniciado'        },
  { value: 'PRONTO',       label: 'Pronto'          },
  { value: 'SEM MATERIAL', label: 'Sem Material'    },
  { value: 'PENDENCIA',    label: 'Pendência'       },
  { value: 'ENTREGUE',     label: 'Entregue'        },
];

export const AP_URGENTE_FILTER_OPTIONS = [
  { value: 'all', label: 'Todos'   },
  { value: 'sim', label: 'Urgente' },
  { value: 'nao', label: 'Normal'  },
];

export const AP_STATUS_EDIT_OPTIONS = [
  { value: 'EM ABERTO',    label: 'Em Aberto'    },
  { value: 'ESCRITORIO',   label: 'Escritório'   },
  { value: 'PRODUCAO',     label: 'Produção'     },
  { value: 'IMPRESSO',     label: 'Impresso'     },
  { value: 'INICIADO',     label: 'Iniciado'     },
  { value: 'PRONTO',       label: 'Pronto'       },
  { value: 'SEM MATERIAL', label: 'Sem Material' },
  { value: 'PENDENCIA',    label: 'Pendência'    },
  { value: 'ENTREGUE',     label: 'Entregue'     },
];
