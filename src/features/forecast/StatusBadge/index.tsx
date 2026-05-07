import './index.css';

const COLOR_MAP: Record<string, string> = {
  aguardando:   'neutral',
  nao_iniciado: 'neutral',
  em_producao:  'info',
  em_andamento: 'active',
  pausado:      'warning',
  finalizado:   'success',
  concluido:    'success',
  atrasado:     'danger',
};

interface StatusBadgeProps {
  status: string;
  label: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const color = COLOR_MAP[status] ?? 'neutral';
  const cls = `fcst-badge fcst-badge--${color}${size === 'sm' ? ' fcst-badge--sm' : ''}`;
  return <span className={cls}>{label}</span>;
}
