import type { CapaData } from "../capaData";

export function PrintFooter({ data }: { data: CapaData }) {
  return (
    <div className="print-footer">
      <div className="cp-row" style={{ height: 30, borderBottom: "0.25pt solid #000" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", paddingLeft: 6 }}>
          <label className="cp-label" style={{ fontSize: 9 }}>
            {data.contrato} · {data.cliente} · {data.ambiente}
          </label>
        </div>
        <div style={{ width: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <label className="cp-label" style={{ fontSize: 9 }}>
            Data: ____/____/________
          </label>
        </div>
      </div>
      <div style={{ height: 40, display: "flex", alignItems: "end", padding: "0 10px", gap: 24 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontFamily: "inherit" }}>
          <input type="checkbox" style={{ width: 13, height: 13 }} /> Completo
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontFamily: "inherit" }}>
          <input type="checkbox" style={{ width: 13, height: 13 }} /> Faltando
        </label>
        <span style={{ flex: 1, borderBottom: "0.25pt solid #000" }} />
        <label className="cp-label" style={{ fontSize: 9, whiteSpace: "nowrap" }}>
          Responsável: _______________________
        </label>
      </div>
    </div>
  );
}
