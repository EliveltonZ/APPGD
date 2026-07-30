import type { EtapaInfo } from "../capaData";

const DATE_PH = "___/___/___  ___:___";

export function EtapaRow({
  label,
  etapa,
  filled = false,
}: {
  label: string;
  etapa?: EtapaInfo;
  filled?: boolean;
}) {
  return (
    <div className="cp-row" style={{ height: 26 }}>
      <div className="cp-cell cp-no-r cp-no-t cp-center cp-bg-blue" style={{ width: 122.766 }}>
        <label className="cp-label cp-bold">{label}</label>
      </div>
      <div className="cp-cell cp-no-r cp-no-t cp-center" style={{ width: 170 }}>
        <label className="cp-label cp-etapa-date">
          {filled ? etapa?.inicio || DATE_PH : DATE_PH}
        </label>
      </div>
      <div className="cp-cell cp-no-r cp-no-t cp-center" style={{ width: 170 }}>
        <label className="cp-label cp-etapa-date">
          {filled ? etapa?.fim || DATE_PH : DATE_PH}
        </label>
      </div>
      <div className="cp-cell cp-no-r cp-no-t cp-center" style={{ width: 170 }}>
        {filled && <label className="cp-label">{etapa?.responsavel ?? ""}</label>}
      </div>
      <div className="cp-cell cp-no-t cp-center" style={{ flex: 1, minWidth: 60 }}>
        {filled && <label className="cp-label">{etapa?.pausa ?? ""}</label>}
      </div>
    </div>
  );
}
