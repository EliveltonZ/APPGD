import type { AssistanceProduction } from '../../../../../types/assistenciaProducao';

interface Props {
  data: AssistanceProduction;
  onChange: <K extends keyof AssistanceProduction>(key: K, value: AssistanceProduction[K]) => void;
}

export function NotesSection({ data, onChange }: Props) {
  return (
    <div className="ap-section">
      <h4 className="ap-section__title">Observações</h4>
      <div className="ap-section__body">
        <div className="frow--2">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className="ap-read__label">Observações Fábrica</span>
            <textarea
              className="ap-textarea"
              rows={3}
              value={data.obsFactory}
              onChange={(e) => onChange('obsFactory', e.target.value)}
              placeholder="Observações do setor de produção..."
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className="ap-read__label">Observações Logística</span>
            <textarea
              className="ap-textarea"
              rows={3}
              value={data.obsLogistics}
              onChange={(e) => onChange('obsLogistics', e.target.value)}
              placeholder="Observações do setor logístico..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}