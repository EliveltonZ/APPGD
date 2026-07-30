import { B } from "./constants";

const DATE_PH = "______/______/______ _____:_____";

export function StageRow({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "121px 170px 170px 1fr 135px",
        borderLeft: B,
      }}
    >
      <div
        style={{
          height: 35,
          background: "#BDD7EE",
          borderRight: B,
          borderBottom: B,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <label className="form-label fw-bold margin-0">{label}</label>
      </div>

      <div
        style={{
          height: 35,
          borderRight: B,
          borderBottom: B,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
        }}
      >
        <label className="form-label font font-8">{DATE_PH}</label>
      </div>

      <div
        style={{
          height: 35,
          borderRight: B,
          borderBottom: B,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
        }}
      >
        <label className="form-label font font-8">{DATE_PH}</label>
      </div>

      <div style={{ height: 35, borderRight: B, borderBottom: B }} />

      <div style={{ height: 35, borderBottom: B, borderRight: B }} />
    </div>
  );
}
