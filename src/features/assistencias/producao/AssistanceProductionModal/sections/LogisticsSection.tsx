import { Input } from '../../../../../components/Input';
import type { AssistanceProduction } from '../../../../../types/assistenciaProducao';

interface Props {
  data: AssistanceProduction;
  onChange: <K extends keyof AssistanceProduction>(key: K, value: AssistanceProduction[K]) => void;
}

export function LogisticsSection({ data, onChange }: Props) {
  return (
    <div className="ap-section">
      <h4 className="ap-section__title">Logística / Entrega</h4>
      <div className="ap-section__body">
        <div className="frow--3">
          <Input
            label="Data de Entrega"
            value={data.entregue}
            onChange={(e) => onChange('entregue', e.target.value)}
            placeholder="DD/MM/AAAA"
          />
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