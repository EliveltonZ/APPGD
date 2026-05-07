import { Input } from '../../../../../components/Input';
import type { AssistanceProduction } from '../../../../../types/assistenciaProducao';

interface Props {
  data: AssistanceProduction;
  onChange: <K extends keyof AssistanceProduction>(key: K, value: AssistanceProduction[K]) => void;
}

export function ResponsibleSection({ data, onChange }: Props) {
  return (
    <div className="ap-section">
      <h4 className="ap-section__title">Responsáveis</h4>
      <div className="ap-section__body">
        <div className="frow--3">
          <Input
            label="Supervisor"
            value={data.supervisor}
            onChange={(e) => onChange('supervisor', e.target.value)}
            placeholder="Nome do supervisor"
          />
          <Input
            label="Liberador"
            value={data.liberador}
            onChange={(e) => onChange('liberador', e.target.value)}
            placeholder="Nome do liberador"
          />
          <Input
            label="Conferente"
            value={data.conferente}
            onChange={(e) => onChange('conferente', e.target.value)}
            placeholder="Nome do conferente"
          />
        </div>
        <div className="frow--2">
          <Input
            label="Despachante"
            value={data.despachante}
            onChange={(e) => onChange('despachante', e.target.value)}
            placeholder="Nome do despachante"
          />
          <Input
            label="Motorista"
            value={data.motorista}
            onChange={(e) => onChange('motorista', e.target.value)}
            placeholder="Nome do motorista"
          />
        </div>
      </div>
    </div>
  );
}