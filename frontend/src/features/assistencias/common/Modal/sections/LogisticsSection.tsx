import { SectionField } from '../SectionField';
import type { AssistanceProduction } from '../../../../../types/assistenciaProducao';

interface Props {
  data: AssistanceProduction;
  onChange: <K extends keyof AssistanceProduction>(key: K, value: AssistanceProduction[K]) => void;
  readOnly?: boolean;
}

export function LogisticsSection({ data, onChange, readOnly }: Props) {
  return (
    <div className="ap-section">
      <h4 className="ap-section__title">Logística / Entrega</h4>
      <div className="ap-section__body">
        <div className="frow--3">
          <SectionField label="Data de Entrega" value={data.entregue}    onChange={(v) => onChange('entregue', v)}    readOnly={readOnly} type="date"                  />
          <SectionField label="Despachante"      value={data.despachante} onChange={(v) => onChange('despachante', v)} readOnly={readOnly} placeholder="Nome do despachante" />
          <SectionField label="Motorista"        value={data.motorista}   onChange={(v) => onChange('motorista', v)}   readOnly={readOnly} placeholder="Nome do motorista"   />
        </div>
      </div>
    </div>
  );
}
