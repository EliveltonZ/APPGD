import type { Purchase } from "../../../../types/purchases";

interface Props {
  data: Purchase;
  onChange: (data: Purchase) => void;
}

export function StatusSection({ data, onChange }: Props) {
  return (
    <div className="pinfo-section">
      <div className="pur-status-row"></div>
      <div className="frow frow--1">
        <div className="pfield pfield--full">
          <label>Observações</label>
          <textarea
            rows={3}
            value={data.observacoes}
            onChange={(e) => onChange({ ...data, observacoes: e.target.value })}
            placeholder="Observações sobre esta compra..."
          />
        </div>
      </div>
    </div>
  );
}
