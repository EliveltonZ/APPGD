import type { CapaData } from "../capaData";

export function InfoProducao({ data }: { data: CapaData }) {
  return (
    <>
      <div className="cp-title cp-bg-red cp-cell" style={{ marginTop: 8 }}>
        INFORMAÇÕES DE PRODUÇÃO
      </div>
      <div className="cp-row" style={{ height: 50 }}>
        <div className="cp-cell cp-no-r cp-no-t cp-center" style={{ width: "18%" }}>
          <label className="cp-label" style={{ fontSize: 13 }}>{data.tipo ?? ""}</label>
        </div>
        <div className="cp-cell" style={{ width: "27%", borderTop: "none", display: "block" }}>
          <div style={{ display: "flex", alignItems: "center", height: "50%", paddingLeft: 3 }}>
            <label className="cp-label" style={{ fontSize: 10 }}>Responsavel:</label>
            <label className="cp-label cp-bold" style={{ fontSize: 10, marginLeft: 6 }}>
              {data.responsavel ?? ""}
            </label>
          </div>
          <div style={{ display: "flex", alignItems: "center", height: "50%", paddingLeft: 3 }}>
            <label className="cp-label" style={{ fontSize: 10, width: 60, textAlign: "right" }}>Data:</label>
            <label className="cp-label" style={{ marginLeft: 6 }}>{data.data ?? ""}</label>
          </div>
        </div>
        <div className="cp-cell cp-no-l cp-no-t cp-center" style={{ width: "27%" }}>
          <label className="cp-label cp-bold">ENVIADO P/ CORTE</label>
        </div>
        <div style={{ flex: 1, border: "0.25pt solid #000", borderTop: "none", borderLeft: "none" }}>
          <div style={{ display: "flex", alignItems: "center", height: "50%", borderBottom: "0.25pt solid #000", paddingLeft: 3 }}>
            <label className="cp-label" style={{ fontSize: 10 }}>Responsavel:</label>
          </div>
          <div style={{ display: "flex", alignItems: "center", height: "50%", paddingLeft: 3 }}>
            <label className="cp-label" style={{ fontSize: 10 }}>Data:</label>
          </div>
        </div>
      </div>
    </>
  );
}
