import { B } from "./constants";
import type { Peca } from "./types";

function notNull(v: unknown): string {
  const s = String(v ?? "");
  return s === "null" || s === "" ? "-" : s;
}

export function PecaItem({ peca }: { peca: Peca }) {
  return (
    <div className="item-peca" style={{ marginTop: 15, borderBottom: B }}>
      <div style={{ display: "grid", gridTemplateColumns: "60px 270px 123px 1fr", gap: 8 }}>
        <div className="div-block">
          <label className="fw-bold text-danger">Qtd:</label>
          <label>{notNull(peca.qtd)}</label>
        </div>
        <div className="div-block">
          <label className="fw-bold text-danger">Peça:</label>
          <label>{notNull(peca.peca)}</label>
        </div>
        <div className="div-block">
          <label className="fw-bold text-danger">Dimensões:</label>
          <label>{notNull(peca.dimensoes)}</label>
        </div>
        <div className="div-block">
          <label className="fw-bold text-danger">Cor:</label>
          <label>{notNull(peca.cor)}</label>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "265px 120px 165px 105px", gap: 8, width: "100%" }}>
        <div>
          <label className="fw-bold text-danger">Motivo:</label>
          <label style={{ marginLeft: 4 }}>{notNull(peca.falha)}</label>
        </div>
        <div>
          <label className="fw-bold text-danger">Tipo:</label>
          <label style={{ marginLeft: 4 }}>{notNull(peca.ocorrencia)}</label>
        </div>
        <div>
          <label className="fw-bold text-danger">Orientação:</label>
          <label style={{ marginLeft: 4 }}>{notNull(peca.lado)}</label>
        </div>
        <div>
          <label className="fw-bold text-danger">Ordem:</label>
          <label style={{ marginLeft: 4 }}>{notNull(peca.codigo)}</label>
        </div>
      </div>

      <div className="d-flex gap-2" style={{ width: "100%" }}>
        <div style={{ flex: 1 }}>
          <label className="form-label fw-bold text-danger d-block margin-0">Observações:</label>
          <label className="form-label d-block margin-0">{notNull(peca.observacoes)}</label>
        </div>
      </div>
    </div>
  );
}
