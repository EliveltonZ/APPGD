import { B } from "./constants";
import { ExpRow } from "./Exp";

type ExpRowDef = { label: string; lastBg?: string; lastLabel?: string; splitLast?: boolean };

const EXP_ROWS: ExpRowDef[] = [
  { label: "ACESSORIOS AVULSO" },
  { label: "PAINEIS",           lastBg: "#C6E0B4", lastLabel: "DATA:",                  splitLast: true },
  { label: "PORTA DE ALUMINIO", lastBg: "#C6E0B4", lastLabel: "CONFERIDO POR:",         splitLast: true },
  { label: "VIDROS / ESPELHOS", lastBg: "#C6E0B4", lastLabel: "DATA DA RETIRADA:" },
  { label: "PEÇAS C/ PINTURAS" },
  { label: "TAPEÇARIA",         lastBg: "#C6E0B4", lastLabel: "RESPONSAVEL RETIRADA:" },
  { label: "SERRALHERIA" },
];

export function ExpedicaoBlock() {
  return (
    <>
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ marginTop: 16, height: 25, background: "#F9ADAD", border: B }}
      >
        <label className="form-label fw-bold">EXPEDIÇÃO</label>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "367.5px 92px 1fr", height: 36, borderBottom: B }}>
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ background: "#BDD7EE", borderRight: B, borderLeft: B }}
        >
          <label className="form-label fw-bold">VOLUMES DE MODULAÇÃO / PEÇAS</label>
        </div>
        <div style={{ borderRight: B }} />
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ background: "#C6E0B4", borderRight: B }}
        >
          <label className="form-label fw-bold margin-0">TOTAL DE VOLUMES:</label>
        </div>
      </div>
      {EXP_ROWS.map((r) => (
        <ExpRow key={r.label} {...r} />
      ))}
    </>
  );
}
