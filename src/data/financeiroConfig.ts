import type { MarginStatus, MarginFilter } from '../types/financeiro';

export const MARGIN_STATUS_LABELS: Record<MarginStatus, string> = {
  healthy:  'Saudável',
  medium:   'Regular',
  low:      'Baixo',
  negative: 'Negativo',
};

export const MARGIN_FILTER_OPTIONS: { value: MarginFilter; label: string }[] = [
  { value: 'all',      label: 'Todas as margens'  },
  { value: 'healthy',  label: 'Saudável (≥ 25%)'  },
  { value: 'medium',   label: 'Regular (15–24%)'  },
  { value: 'low',      label: 'Baixo (0–14%)'     },
  { value: 'negative', label: 'Negativo (< 0%)'   },
];