import { B } from "./constants";

export function AstecaBlock({ supervisor }: { supervisor: string }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "121px 247px 93px 1fr",
        marginTop: 16,
        borderRight: B,
        borderBottom: B,
        borderLeft: B,
      }}
    >
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: 35, background: "#F9ADAD", borderTop: B }}
      >
        <label className="form-label fw-bold nowrap">ASTECA LIBERADA</label>
      </div>
      <div style={{ height: 35, borderLeft: B, borderTop: B }}>
        <label className="form-label fw-bold margin-0 font-10" style={{ marginLeft: 5 }}>
          DATA:
        </label>
      </div>
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: 35, background: "#F9ADAD", borderTop: B, borderLeft: B }}
      >
        <label className="form-label fw-bold">SUPERVISOR</label>
      </div>
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: 35, borderLeft: B, borderTop: B }}
      >
        <label className="form-label margin-0">{supervisor}</label>
      </div>
    </div>
  );
}
