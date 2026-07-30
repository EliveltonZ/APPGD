import { B } from "./constants";

export function ExpRow({
  label,
  lastBg,
  lastLabel,
  splitLast,
}: {
  label: string;
  lastBg?: string;
  lastLabel?: string;
  splitLast?: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "121px 85px 85px 76px 92px 1fr",
        borderRight: B,
        borderLeft: B,
        borderBottom: B,
        height: 33,
      }}
    >
      <div
        style={{
          background: "#BDD7EE",
          borderRight: B,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <label className="form-label fw-bold margin-0 font-10">{label}</label>
      </div>

      <div
        style={{ borderRight: B, display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <label className="form-label fw-bold margin-0">□ SIM</label>
      </div>

      <div
        style={{ borderRight: B, display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <label className="form-label fw-bold margin-0">□ NÃO</label>
      </div>

      <div
        style={{
          background: "#BDD7EE",
          borderRight: B,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <label className="form-label fw-bold margin-0">VOLUMES:</label>
      </div>

      <div style={{ borderRight: B }} />

      <div style={{ background: lastBg }}>
        {splitLast ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "100%" }}>
            <div
              style={{
                borderRight: B,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {lastLabel && (
                <label className="form-label fw-bold margin-0 font-11 nowrap">{lastLabel}</label>
              )}
            </div>
            <div style={{ backgroundColor: "white" }} />
          </div>
        ) : (
          <div
            style={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}
          >
            {lastLabel && (
              <label className="form-label fw-bold margin-0 font-11 nowrap">{lastLabel}</label>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
