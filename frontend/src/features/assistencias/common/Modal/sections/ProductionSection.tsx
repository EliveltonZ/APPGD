import { SectionField } from '../SectionField';
import type { AssistanceProduction } from '../../../../../types/assistenciaProducao';

interface Props {
  data: AssistanceProduction;
  onChange: <K extends keyof AssistanceProduction>(key: K, value: AssistanceProduction[K]) => void;
  readOnly?: boolean;
}

export function ProductionSection({ data, onChange, readOnly }: Props) {
  return (
    <div className="ap-section">
      <h4 className="ap-section__title">Produção</h4>
      <div className="ap-section__body">
        <div className="ap-dates-row">
          <SectionField label="Iniciado" value={data.iniciado} onChange={(v) => onChange('iniciado', v)} readOnly={readOnly} type="date" />
          <SectionField label="Previsão" value={data.previsao} onChange={(v) => onChange('previsao', v)} readOnly={readOnly} type="date" />
          <SectionField label="Pronto"   value={data.pronto}   onChange={(v) => onChange('pronto', v)}   readOnly={readOnly} type="date" />
        </div>
      </div>
    </div>
  );
}
