import type { CapaData } from "../capaData";

export function IdentificacaoSection({ data }: { data: CapaData }) {
  return (
    <>
      <div className="cp-row" style={{ height: 26, marginTop: 8 }}>
        <div className="cp-cell cp-no-r cp-center" style={{ width: 122 }}>
          <label className="cp-label cp-bold cp-font">CÓD. CORTE CERTO</label>
        </div>
        <div className="cp-cell cp-no-r cp-center" style={{ width: 96 }}>
          <label className="cp-label cp-bold cp-font">LOTE</label>
        </div>
        <div className="cp-cell cp-no-r cp-center" style={{ width: 104 }}>
          <label className="cp-label cp-bold cp-font">PEDIDO</label>
        </div>
        <div className="cp-cell cp-no-r cp-center" style={{ width: 131 }}>
          <label className="cp-label cp-bold cp-font">CONTRATO</label>
        </div>
        <div className="cp-cell cp-no-r cp-center" style={{ width: 110 }}>
          <label className="cp-label cp-bold cp-font">QTDE PROJETOS</label>
        </div>
        <div className="cp-cell cp-no-r cp-center" style={{ width: 90 }}>
          <label className="cp-label cp-bold cp-font">NUM. PROJETO</label>
        </div>
        <div className="cp-cell cp-center" style={{ flex: 1 }}>
          <label className="cp-label cp-bold cp-font">URG</label>
        </div>
      </div>

      <div className="cp-row" style={{ height: 26 }}>
        <div className="cp-cell cp-no-r cp-no-t cp-center" style={{ width: 122 }}>
          <label className="cp-label">{data.corte ?? ""}</label>
        </div>
        <div className="cp-cell cp-no-r cp-no-t cp-center" style={{ width: 96 }}>
          <label className="cp-label">{data.lote ?? ""}</label>
        </div>
        <div className="cp-cell cp-no-r cp-no-t cp-center" style={{ width: 104 }}>
          <label className="cp-label">{data.pedido ?? ""}</label>
        </div>
        <div className="cp-cell cp-no-r cp-no-t cp-center" style={{ width: 131 }}>
          <label className="cp-label">{data.contrato ?? ""}</label>
        </div>
        <div className="cp-cell cp-no-r cp-no-t cp-center" style={{ width: 110 }}>
          <label className="cp-label">{data.qtdeProjetos ?? ""}</label>
        </div>
        <div className="cp-cell cp-no-r cp-no-t cp-center" style={{ width: 90 }}>
          <label className="cp-label">{data.numProjeto ?? ""}</label>
        </div>
        <div className={`cp-cell cp-no-t cp-center${data.urgente ? " cp-urg" : ""}`} style={{ flex: 1 }}>
          <label className="cp-label">{data.urgente || "—"}</label>
        </div>
      </div>
    </>
  );
}
