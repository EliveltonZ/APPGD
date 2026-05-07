import { Input } from '../../../../../components/Input';
import type { AssistanceProduction } from '../../../../../types/assistenciaProducao';

interface Props {
  data: AssistanceProduction;
  onChange: <K extends keyof AssistanceProduction>(key: K, value: AssistanceProduction[K]) => void;
}

export function ProductionSection({ data, onChange }: Props) {
  return (
    <div className="ap-section">
      <h4 className="ap-section__title">Produção</h4>
      <div className="ap-section__body">
        <div className="frow--3">
          <Input
            label="Iniciado"
            value={data.iniciado}
            onChange={(e) => onChange('iniciado', e.target.value)}
            placeholder="DD/MM/AAAA"
          />
          <Input
            label="Previsão"
            value={data.previsao}
            onChange={(e) => onChange('previsao', e.target.value)}
            placeholder="DD/MM/AAAA"
          />
          <Input
            label="Pronto"
            value={data.pronto}
            onChange={(e) => onChange('pronto', e.target.value)}
            placeholder="DD/MM/AAAA"
          />
        </div>
      </div>
    </div>
  );
}