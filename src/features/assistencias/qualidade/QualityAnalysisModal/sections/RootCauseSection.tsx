import { AlertTriangle, CheckCircle } from 'lucide-react';
import type { QualityItem } from '../../../../../types/qualityControl';

interface Props {
  data: QualityItem;
  onChange: <K extends keyof QualityItem>(key: K, value: QualityItem[K]) => void;
}

export function RootCauseSection({ data, onChange }: Props) {
  const isEmpty = !data.causaRaiz.trim();

  return (
    <div className="qc-section">
      <h4 className="qc-section__title">Causa Raiz</h4>
      <div className="qc-section__body">
        {isEmpty ? (
          <p className={`qc-root-cause__hint qc-root-cause__hint--warning`}>
            <AlertTriangle size={13} />
            Causa raiz não preenchida — item pendente de análise.
          </p>
        ) : (
          <p className="qc-root-cause__hint">
            <CheckCircle size={13} />
            Causa raiz registrada — salve para confirmar.
          </p>
        )}
        <textarea
          className={`qc-textarea${isEmpty ? ' qc-textarea--highlight' : ''}`}
          rows={5}
          value={data.causaRaiz}
          onChange={(e) => onChange('causaRaiz', e.target.value)}
          placeholder="Descreva detalhadamente a causa raiz identificada e as ações corretivas tomadas..."
        />
      </div>
    </div>
  );
}