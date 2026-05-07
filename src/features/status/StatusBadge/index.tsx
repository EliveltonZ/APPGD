import './index.css'

type BadgeVariant = 'neutral' | 'info' | 'active' | 'warning' | 'success' | 'danger'

const VARIANT_MAP: Record<string, BadgeVariant> = {
  aguardando:   'neutral',
  em_producao:  'info',
  concluido:    'success',
  atrasado:     'danger',
  nao_iniciado: 'neutral',
  em_andamento: 'active',
  pausado:      'warning',
  ok:           'success',
  pendente:     'warning',
}

const LABEL_MAP: Record<string, string> = {
  aguardando:   'Aguardando',
  em_producao:  'Em Produção',
  concluido:    'Concluído',
  atrasado:     'Atrasado',
  nao_iniciado: 'Não Iniciado',
  em_andamento: 'Em Andamento',
  pausado:      'Pausado',
  ok:           'OK',
  pendente:     'Pendente',
}

interface StatusBadgeProps {
  status: string
  label?: string
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const variant = VARIANT_MAP[status] ?? 'neutral'
  const text = label ?? LABEL_MAP[status] ?? status
  return (
    <span className={`st-badge st-badge--${variant}${size === 'sm' ? ' st-badge--sm' : ''}`}>
      {text}
    </span>
  )
}
