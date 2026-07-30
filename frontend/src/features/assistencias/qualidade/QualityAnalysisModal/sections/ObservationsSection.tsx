import type { QualityItem } from '../../../../../types/qualityControl';

interface Props {
  data: QualityItem;
}

export function ObservationsSection({ data }: Props) {
  return (
    <div className="qc-section">
      <h4 className="qc-section__title">Observações</h4>
      <div className="qc-section__body">
        <div className="qc-read">
          <span className="qc-read__value qc-read__value--obs">
            {data.observacoes || 'Sem observações.'}
          </span>
        </div>
      </div>
    </div>
  );
}