import { SectionField } from '../SectionField';
import type { AssistanceProduction } from '../../../../../types/assistenciaProducao';

interface Props {
  data: AssistanceProduction;
  onChange: <K extends keyof AssistanceProduction>(key: K, value: AssistanceProduction[K]) => void;
  readOnly?: boolean;
  readOnlySupervisors?: boolean;
}

export function ResponsibleSection({ data, onChange, readOnly, readOnlySupervisors }: Props) {
  return (
    <div className="ap-section">
      <h4 className="ap-section__title">Responsáveis</h4>
      <div className="ap-section__body">
        <div className="frow--3">
          <SectionField label="Supervisor" value={data.supervisor} onChange={(v) => onChange('supervisor', v)} readOnly={readOnly || readOnlySupervisors} placeholder="Nome do supervisor" />
          <SectionField label="Liberador"  value={data.liberador}  onChange={(v) => onChange('liberador', v)}  readOnly={readOnly || readOnlySupervisors} placeholder="Nome do liberador"  />
          <SectionField label="Conferente" value={data.conferente} onChange={(v) => onChange('conferente', v)} readOnly={readOnly} placeholder="Nome do conferente" />
        </div>
        <div className="frow--2">
          <SectionField label="Despachante" value={data.despachante} onChange={(v) => onChange('despachante', v)} readOnly={readOnly} placeholder="Nome do despachante" />
          <SectionField label="Motorista"   value={data.motorista}   onChange={(v) => onChange('motorista', v)}   readOnly={readOnly} placeholder="Nome do motorista"   />
        </div>
      </div>
    </div>
  );
}
