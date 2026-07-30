import { Select } from '../../../../../components/Select';
import type { QualityItem } from '../../../../../types/qualityControl';
import { OCCURRENCE_OPTIONS } from '../../../../../data/qualityControlConfig';

interface Props {
  data: QualityItem;
  onChange: <K extends keyof QualityItem>(key: K, value: QualityItem[K]) => void;
  falhaOptions: Array<{ value: string; label: string }>;
  causaOptions: Array<{ value: string; label: string }>;
}

export function ClassificationSection({ data, onChange, falhaOptions, causaOptions }: Props) {
  return (
    <div className="qc-section">
      <h4 className="qc-section__title">Classificação</h4>
      <div className="qc-section__body">
        <div className="frow--3">
          <Select
            label="Ocorrência"
            placeholder="Selecionar ocorrência..."
            value={data.ocorrencia}
            onChange={(e) =>
              onChange('ocorrencia', e.target.value as QualityItem['ocorrencia'])
            }
            options={OCCURRENCE_OPTIONS}
          />
          <div style={{ gridColumn: 'span 2' }} />
        </div>
        <Select
          label="Falha"
          placeholder="Selecionar falha..."
          value={data.falha}
          onChange={(e) => {
            onChange('falha', e.target.value);
            onChange('causa', '');
          }}
          options={falhaOptions}
        />
        <Select
          label="Causa"
          placeholder="Selecionar causa..."
          value={data.causa}
          onChange={(e) => onChange('causa', e.target.value)}
          options={causaOptions}
        />
      </div>
    </div>
  );
}
