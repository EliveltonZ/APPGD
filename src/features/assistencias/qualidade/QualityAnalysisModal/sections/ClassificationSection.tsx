import { Select } from '../../../../../components/Select';
import type { QualityItem } from '../../../../../types/qualityControl';
import {
  OCCURRENCE_OPTIONS,
  FAILURE_OPTIONS,
  CAUSE_OPTIONS,
} from '../../../../../data/qualityControlConfig';

interface Props {
  data: QualityItem;
  onChange: <K extends keyof QualityItem>(key: K, value: QualityItem[K]) => void;
}

const OCCURRENCE_WITH_PLACEHOLDER = [
  { value: '', label: 'Selecionar ocorrência...' },
  ...OCCURRENCE_OPTIONS,
];

const CAUSE_WITH_PLACEHOLDER = [
  { value: '', label: 'Selecionar causa...' },
  ...CAUSE_OPTIONS,
];

const FAILURE_WITH_PLACEHOLDER = [
  { value: '', label: 'Selecionar falha...' },
  ...FAILURE_OPTIONS,
];

export function ClassificationSection({ data, onChange }: Props) {
  return (
    <div className="qc-section">
      <h4 className="qc-section__title">Classificação</h4>
      <div className="qc-section__body">
        <div className="frow--3">
          <Select
            label="Ocorrência"
            value={data.ocorrencia}
            onChange={(e) =>
              onChange('ocorrencia', e.target.value as QualityItem['ocorrencia'])
            }
            options={OCCURRENCE_WITH_PLACEHOLDER}
          />
          <Select
            label="Causa"
            value={data.causa}
            onChange={(e) =>
              onChange('causa', e.target.value as QualityItem['causa'])
            }
            options={CAUSE_WITH_PLACEHOLDER}
          />
          <div style={{ gridColumn: 'span 1' }} />
        </div>
        <Select
          label="Falha"
          value={data.falha}
          onChange={(e) => onChange('falha', e.target.value)}
          options={FAILURE_WITH_PLACEHOLDER}
        />
      </div>
    </div>
  );
}