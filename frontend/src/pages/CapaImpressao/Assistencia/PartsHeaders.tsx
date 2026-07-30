import { B } from "./constants";

const PART_HEADERS = ["ETAPAS:", "INÍCIO:", "FIM:", "RESPONSÁVEL", "PAUSA"];

export function PartsHeaders() {
  const cellStyle = {
    height: 35,
    background: "#BDD7EE",
    borderRight: B,
    borderBottom: B,
    display: "flex",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  };
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "121px 170px 170px 1fr 135px",
        marginTop: 16,
        borderTop: B,
        borderLeft: B,
      }}
    >
      {PART_HEADERS.map((h) => (
        <div key={h} style={cellStyle}>
          <label className="form-label fw-bold text-center margin-0">{h}</label>
        </div>
      ))}
    </div>
  );
}
