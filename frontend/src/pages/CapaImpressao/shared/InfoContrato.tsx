import type { CapaData } from "../capaData";

export function InfoContrato({ data }: { data: CapaData }) {
  return (
    <>
      <div className="cp-title cp-bg-red cp-cell" style={{ marginTop: 8 }}>
        INFORMAÇÕES DO CONTRATO
      </div>
      <div className="cp-row" style={{ height: 26 }}>
        <div className="cp-cell cp-no-r cp-no-t cp-center" style={{ width: 122 }}>
          <label className="cp-label cp-bold">CLIENTE:</label>
        </div>
        <div className="cp-cell cp-no-r cp-no-t" style={{ width: 343, paddingLeft: 5 }}>
          <label className="cp-label">{data.cliente ?? ""}</label>
        </div>
        <div className="cp-cell cp-no-r cp-no-t cp-center" style={{ width: 104 }}>
          <label className="cp-label cp-bold">N° O.C.:</label>
        </div>
        <div className="cp-cell cp-no-t cp-center" style={{ flex: 1 }}>
          <label className="cp-label">{data.numOc ?? ""}</label>
        </div>
      </div>
      <div className="cp-row" style={{ height: 26 }}>
        <div className="cp-cell cp-no-r cp-no-t cp-center" style={{ width: 122 }}>
          <label className="cp-label cp-bold">AMBIENTE:</label>
        </div>
        <div className="cp-cell cp-no-r cp-no-t" style={{ width: 343, paddingLeft: 5 }}>
          <label className="cp-label">{data.ambiente ?? ""}</label>
        </div>
        <div className="cp-cell cp-no-r cp-no-t cp-center cp-bg-green" style={{ width: 104 }}>
          <label className="cp-label cp-bold">ENTREGA:</label>
        </div>
        <div className="cp-cell cp-no-t cp-center" style={{ flex: 1 }}>
          <label className="cp-label" style={{ color: "red" }}>{data.dataEntrega ?? ""}</label>
        </div>
      </div>
      <div className="cp-row" style={{ height: 26 }}>
        <div className="cp-cell cp-no-r cp-no-t cp-center" style={{ width: 122 }}>
          <label className="cp-label cp-bold">VENDEDOR:</label>
        </div>
        <div className="cp-cell cp-no-r cp-no-t" style={{ width: 343, paddingLeft: 5 }}>
          <label className="cp-label">{data.vendedor ?? ""}</label>
        </div>
        <div className="cp-cell cp-no-r cp-no-t cp-center" style={{ width: 104 }}>
          <label className="cp-label cp-bold">LIBERADOR:</label>
        </div>
        <div className="cp-cell cp-no-t cp-center" style={{ flex: 1 }}>
          <label className="cp-label">{data.liberador ?? ""}</label>
        </div>
      </div>
    </>
  );
}
