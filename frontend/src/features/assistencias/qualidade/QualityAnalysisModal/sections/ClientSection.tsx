import type { QualityItem } from '../../../../../types/qualityControl';

interface Props {
  data: QualityItem;
}

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div className="qc-read">
      <span className="qc-read__label">{label}</span>
      <span className="qc-read__value">{value || '—'}</span>
    </div>
  );
}

export function ClientSection({ data }: Props) {
  return (
    <div className="qc-section">
      <h4 className="qc-section__title">Cliente e Ambiente</h4>
      <div className="qc-section__body">
        <div className="frow--2">
          <ReadField label="Cliente"  value={data.cliente}  />
          <ReadField label="Ambiente" value={data.ambiente} />
        </div>
      </div>
    </div>
  );
}