import type { QualityItem } from '../../../../../types/qualityControl';
import { QualityStatusBadge } from '../../QualityStatusBadge';

interface Props {
  data: QualityItem;
}

function ReadField({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="qc-read">
      <span className="qc-read__label">{label}</span>
      <span className="qc-read__value">{String(value) || '—'}</span>
    </div>
  );
}

export function ItemDataSection({ data }: Props) {
  return (
    <div className="qc-section">
      <h4 className="qc-section__title">Dados da Peça</h4>
      <div className="qc-section__body">
        <div className="frow--4">
          <ReadField label="Código"       value={data.codigo}       />
          <ReadField label="ID Assist."   value={data.idAssistencia}/>
          <ReadField label="Quantidade"   value={data.qtd}          />
          <div className="qc-read">
            <span className="qc-read__label">Status</span>
            <div style={{ paddingTop: 6 }}>
              <QualityStatusBadge status={data.status} />
            </div>
          </div>
        </div>
        <div className="frow--3">
          <ReadField label="Peça"        value={data.peca}       />
          <ReadField label="Cor"         value={data.cor}        />
          <ReadField label="Dimensões"   value={data.dimensoes}  />
        </div>
        <div className="frow--2">
          <ReadField label="Orientação"  value={data.orientacao} />
          <ReadField label="Supervisor"  value={data.supervisor} />
        </div>
      </div>
    </div>
  );
}