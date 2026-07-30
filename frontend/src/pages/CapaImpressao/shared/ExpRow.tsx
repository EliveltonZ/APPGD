import type { ExpedicaoLinha } from "../capaData";

export function ExpRow({
  label,
  item,
  hasCheckboxes = true,
  filled = false,
}: {
  label: string;
  item?: ExpedicaoLinha;
  hasCheckboxes?: boolean;
  filled?: boolean;
}) {
  return (
    <div className="cp-row" style={{ height: 26 }}>
      <div className="cp-cell cp-no-r cp-no-t cp-center cp-bg-blue" style={{ width: 114 }}>
        <label className="cp-label cp-bold cp-font">{label}</label>
      </div>
      {hasCheckboxes && (
        <>
          <div className="cp-cell cp-no-r cp-no-t cp-center" style={{ width: 59.64 }}>
            <label className="cp-label"> □ SIM</label>
          </div>
          <div className="cp-cell cp-no-r cp-no-t cp-center" style={{ width: 59.64 }}>
            <label className="cp-label cp-font-10"> □ NÃO</label>
          </div>
        </>
      )}
      <div className="cp-cell cp-no-r cp-no-t cp-center cp-bg-blue" style={{ width: 55 }}>
        <label className="cp-label cp-font-10">VOLUMES:</label>
      </div>
      <div className="cp-cell cp-no-r cp-no-t cp-center" style={{ width: 55 }}>
        {filled && <label className="cp-label">{item?.qtd ?? ""}</label>}
      </div>
      <div className="cp-cell cp-no-r cp-no-t cp-center cp-bg-blue" style={{ width: 42 }}>
        <label className="cp-label cp-font-10">BOX:</label>
      </div>
      <div className="cp-cell cp-no-r cp-no-t cp-center" style={{ width: 55 }}>
        {filled && <label className="cp-label">{item?.box ?? ""}</label>}
      </div>
      <div className="cp-cell cp-no-r cp-no-t cp-center cp-bg-blue" style={{ width: 120 }}>
        <label className="cp-label cp-font-10">CONFERIDO POR:</label>
      </div>
      <div className="cp-cell cp-no-t cp-center" style={{ flex: 1 }} />
    </div>
  );
}
