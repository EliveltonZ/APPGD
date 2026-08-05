import type { AssistanceProduction } from '../../../../../types/assistenciaProducao';

interface Props {
  data: AssistanceProduction;
  onChange: <K extends keyof AssistanceProduction>(key: K, value: AssistanceProduction[K]) => void;
  readOnly?: boolean;
}

const FLAGS: { key: keyof AssistanceProduction; label: string; color: string }[] = [
  { key: 'flagEscritorio',  label: 'Escritório',   color: 'aguardando' },
  { key: 'flagProducao',    label: 'Produção',     color: 'aguardando' },
  { key: 'flagSemMaterial', label: 'Sem Material', color: 'atrasado'   },
  { key: 'flagPendencia',   label: 'Pendência',    color: 'pendencia'  },
];

export function OperationalStatusSection({ data, onChange, readOnly }: Props) {
  return (
    <div className="ap-section">
      <h4 className="ap-section__title">Status Operacional</h4>
      <div className="ap-section__body">
        <div className="ap-op-group">
          {FLAGS.map(({ key, label, color }) => (
            <button
              key={key}
              type="button"
              className={`ap-op-pill ap-op-pill--${color}${data[key] ? ' ap-op-pill--on' : ''}`}
              onClick={() => !readOnly && onChange(key, !data[key] as AssistanceProduction[typeof key])}
              disabled={readOnly}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
