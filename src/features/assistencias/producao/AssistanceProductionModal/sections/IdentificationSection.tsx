import { Select } from '../../../../../components/Select';
import { ApStatusBadge } from '../../StatusBadge';
import { AP_STATUS_EDIT_OPTIONS } from '../../../../../data/assistenciaProducaoConfig';
import type { AssistanceProduction } from '../../../../../types/assistenciaProducao';

interface Props {
  data: AssistanceProduction;
  onChange: <K extends keyof AssistanceProduction>(key: K, value: AssistanceProduction[K]) => void;
}

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div className="ap-read">
      <span className="ap-read__label">{label}</span>
      <span className="ap-read__value">{value || '—'}</span>
    </div>
  );
}

export function IdentificationSection({ data, onChange }: Props) {
  return (
    <div className="ap-section">
      <h4 className="ap-section__title">Identificação</h4>
      <div className="ap-section__body">
        <div className="frow--4">
          <ReadField label="Nº Solicitação" value={data.numSolicitacao} />
          <ReadField label="Nº Contrato"    value={data.numContrato}    />
          <ReadField label="Corte"          value={data.corte}          />
          <ReadField label="Pedido"         value={data.pedido}         />
        </div>

        <div className="frow--3">
          <ReadField label="Solicitante" value={data.solicitante} />
          <ReadField label="Data / Hora" value={data.dataHora}    />
          <ReadField label="Prazo"       value={data.prazo}       />
        </div>

        <div className="frow--3">
          <div className="fcol--span2">
            <ReadField label="Cliente" value={data.cliente} />
          </div>
          <ReadField label="Ambiente" value={data.ambiente} />
        </div>

        <div className="frow--2">
          <div>
            <span className="ap-read__label" style={{ display: 'block', marginBottom: 6 }}>Situação</span>
            <Select
              value={data.status}
              onChange={(e) =>
                onChange('status', e.target.value as AssistanceProduction['status'])
              }
              options={AP_STATUS_EDIT_OPTIONS}
            />
          </div>
          <div>
            <span className="ap-read__label" style={{ display: 'block', marginBottom: 6 }}>Exibição</span>
            <div style={{ paddingTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ApStatusBadge status={data.status} />
              {data.urgente && <span className="ap-urgente-tag">Urgente</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}