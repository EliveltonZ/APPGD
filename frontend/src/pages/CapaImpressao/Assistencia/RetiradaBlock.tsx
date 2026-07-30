import { B } from "./constants";

export function RetiradaBlock({
  cliente,
  numSolicitacao,
}: {
  cliente: string;
  numSolicitacao: string;
}) {
  return (
    <>
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ marginTop: 16, height: 25, background: "#F9ADAD", border: B }}
      >
        <label className="form-label fw-bold margin-0">RETIRADA DE ASSISTÊNCIA TÉCNICA</label>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "121px 338px 104px 1fr",
          height: 35,
          marginTop: 8,
          border: B,
        }}
      >
        <div className="d-flex justify-content-center align-items-center" style={{ background: "#C6E0B4" }}>
          <label className="form-label fw-bold margin-0 font-10">CLIENTE:</label>
        </div>
        <div className="d-flex justify-content-center align-items-center" style={{ borderLeft: B }}>
          <label className="form-label">{cliente}</label>
        </div>
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ background: "#C6E0B4", borderLeft: B }}
        >
          <label className="form-label fw-bold margin-0 font-10">N° SOLICITAÇÃO:</label>
        </div>
        <div className="d-flex justify-content-center align-items-center" style={{ borderLeft: B }}>
          <label className="form-label">{numSolicitacao}</label>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "121.5px 338px 104px 1fr",
          height: 35,
          borderBottom: B,
          borderRight: B,
        }}
      >
        <div style={{ borderLeft: B }}>
          <label className="d-flex form-label fw-bold margin-0 font-8" style={{ marginLeft: 5, marginTop: -5 }}>
            DATA RETIRADA:
          </label>
        </div>
        <div style={{ borderLeft: B }}>
          <label className="d-flex form-label fw-bold margin-0 font-8" style={{ marginLeft: 5, marginTop: -5 }}>
            RESPONSÁVEL RETIRADA (NOME COMPLETO):
          </label>
        </div>
        <div style={{ borderLeft: B }}>
          <label
            className="d-flex form-label fw-bold margin-0 font-8"
            style={{ marginLeft: 5, marginTop: -5, height: "100%" }}
          >
            ENTREGUE POR:
          </label>
        </div>
      </div>
    </>
  );
}
