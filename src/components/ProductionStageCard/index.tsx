import './index.css';

export type StageStatus =
  | 'nao_iniciado'
  | 'em_andamento'
  | 'pausado'
  | 'concluido'
  | 'atrasado';

export interface ProductionStageCardProps {
  index: number;
  label: string;
  status: StageStatus;
  inicio: string;
  fim: string;
  responsavel: string;
  pausa?: string;
}

const STATUS_LABELS: Record<StageStatus, string> = {
  nao_iniciado: 'Não Iniciado',
  em_andamento: 'Em Andamento',
  pausado:      'Pausado',
  concluido:    'Concluído',
  atrasado:     'Atrasado',
};

function DateValue({ iso }: { iso: string }) {
  if (!iso) return <strong>—</strong>;
  const tIdx = iso.indexOf('T');
  if (tIdx !== -1) {
    const [y, m, d] = iso.slice(0, tIdx).split('-');
    return (
      <>
        <strong>{`${d}/${m}/${y}`}</strong>
        <span className="psc-field__time">{iso.slice(tIdx + 1, tIdx + 6)}</span>
      </>
    );
  }
  const [y, m, d] = iso.split('-');
  return <strong>{`${d}/${m}/${y}`}</strong>;
}

export function ProductionStageCard({
  index, label, status, inicio, fim, pausa, responsavel,
}: ProductionStageCardProps) {
  return (
    <div className={`psc-card psc-card--${status}`}>
      <div className="psc-card__header">
        <span className="psc-card__index">{index}</span>
        <span className="psc-card__label">{label}</span>
        <span className={`psc-badge psc-badge--${status}`}>
          {STATUS_LABELS[status]}
        </span>
      </div>
      <div className="psc-card__body">
        <div className="psc-field">
          <span>Início</span>
          <DateValue iso={inicio} />
        </div>
        <div className="psc-field">
          <span>Fim</span>
          <DateValue iso={fim} />
        </div>
        {pausa && (
          <div className="psc-field">
            <span>Pausa</span>
            <DateValue iso={pausa} />
          </div>
        )}
        <div className="psc-field psc-field--full">
          <span>Responsável</span>
          <strong>{responsavel || '—'}</strong>
        </div>
      </div>
    </div>
  );
}