export function AcessoriosAvulsos() {
  return (
    <div style={{ marginTop: 10 }}>
      <div className="cp-title cp-bg-blue" style={{ border: "0.25pt solid #000" }}>
        ACESSÓRIOS AVULSOS
      </div>
      {Array.from({ length: 11 }).map((_, i) => (
        <div key={i} className="cp-row" style={{ height: 25 }}>
          <div className="cp-cell cp-no-r cp-no-t" style={{ width: "50%", paddingLeft: 4 }}>
            <label className="cp-label" style={{ fontSize: 17 }}>□</label>
          </div>
          <div className="cp-cell cp-no-t" style={{ width: "50%", paddingLeft: 4 }}>
            <label className="cp-label" style={{ fontSize: 17 }}>□</label>
          </div>
        </div>
      ))}
    </div>
  );
}
