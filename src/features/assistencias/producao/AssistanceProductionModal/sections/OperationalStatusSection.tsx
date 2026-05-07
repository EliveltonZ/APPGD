import type { AssistanceProduction } from '../../../../../types/assistenciaProducao';

interface Props {
  data: AssistanceProduction;
  onChange: <K extends keyof AssistanceProduction>(key: K, value: AssistanceProduction[K]) => void;
}

const FLAGS: { key: keyof AssistanceProduction; label: string }[] = [
  { key: 'flagEscritorio',  label: 'Escritório'   },
  { key: 'flagProducao',    label: 'Produção'     },
  { key: 'flagSemMaterial', label: 'Sem Material' },
  { key: 'flagPendencia',   label: 'Pendência'    },
];

export function OperationalStatusSection({ data, onChange }: Props) {
  return (
    <div className="ap-section">
      <h4 className="ap-section__title">Status Operacional</h4>
      <div className="ap-section__body">
        <div className="ap-op-group">
          {FLAGS.map(({ key, label }) => (
            <label key={key} className="ap-op-item">
              <input
                type="checkbox"
                checked={data[key] as boolean}
                onChange={(e) => onChange(key, e.target.checked as AssistanceProduction[typeof key])}
              />
              {label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}