import type { QualityItem } from "../../../../../types/qualityControl";
import { QualityStatusBadge } from "../../QualityStatusBadge";

interface Props {
  data: QualityItem;
  onChange: <K extends keyof QualityItem>(
    key: K,
    value: QualityItem[K],
  ) => void;
}

function ReadField({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="qc-read">
      <span className="qc-read__label">{label}</span>
      <span className="qc-read__value">{String(value) || "—"}</span>
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="qc-read">
      <span className="qc-read__label">{label}</span>
      <input
        className="qc-read__input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function ItemDataSection({ data, onChange }: Props) {
  return (
    <div className="qc-section">
      <h4 className="qc-section__title">Dados da Peça</h4>
      <div className="qc-section__body">
        <div className="frow--4 ap-dates-row">
          <ReadField label="Código" value={data.codigo} />
          <ReadField label="ID Assist." value={data.idAssistencia} />
          <ReadField label="Pedido" value={data.pedido} />
          <EditField
            label="ID ERP"
            value={data.idErp}
            onChange={(v) => onChange("idErp", v)}
          />
        </div>
        <div className="frow--4 ap-dates-row">
          <ReadField label="Quantidade" value={data.qtd} />
          <div className="qc-read">
            <span className="qc-read__label">Status</span>
            <div>
              <QualityStatusBadge status={data.status} />
            </div>
          </div>
        </div>
        <div className="frow--3 ap-dates-row">
          <ReadField label="Peça" value={data.peca} />
          <ReadField label="Cor" value={data.cor} />
          <ReadField label="Dimensões" value={data.dimensoes} />
        </div>
        <div className="frow--2 ap-dates-row">
          <ReadField label="Orientação" value={data.orientacao} />
          <ReadField label="Supervisor" value={data.supervisor} />
        </div>
      </div>
    </div>
  );
}
