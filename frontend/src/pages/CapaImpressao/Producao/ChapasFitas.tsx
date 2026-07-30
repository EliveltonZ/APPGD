export function ChapasFitas() {
  return (
    <>
      <div className="cp-row" style={{ marginTop: 10 }}>
        <div className="cp-cell cp-no-r cp-center cp-bg-blue" style={{ width: "50%", height: 24, fontWeight: 700, fontSize: 14 }}>
          CHAPAS
        </div>
        <div className="cp-cell cp-center cp-bg-blue" style={{ width: "50%", height: 24, fontWeight: 700, fontSize: 14 }}>
          FITAS DE BORDA
        </div>
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="cp-row" style={{ height: 25 }}>
          <div className="cp-cell cp-no-r cp-no-t" style={{ width: "50%" }} />
          <div className="cp-cell cp-no-t" style={{ width: "50%" }} />
        </div>
      ))}
    </>
  );
}
