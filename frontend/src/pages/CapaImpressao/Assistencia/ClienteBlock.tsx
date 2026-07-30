import { type CSSProperties } from "react";
import { B } from "./constants";
import { CreateGrid } from "./Grid";
import type { AssistData } from "./types";

function DivLabel({ header, style }: { header: string; style: CSSProperties }) {
  return (
    <div className="d-flex align-items-center" style={style}>
      <label className="form-label fw-bold" style={{ marginLeft: 5 }}>
        {header}
      </label>
    </div>
  );
}

function DivValue({ data, style }: { data: string; style: CSSProperties }) {
  return (
    <div className="d-flex align-items-center nowrap" style={style}>
      <label className="form-label" style={{ marginLeft: 5, fontSize: 11 }}>
        {data || ""}
      </label>
    </div>
  );
}

function DivLabelAndValue({ header, data, center }: { header: string; data: string; center?: boolean }) {
  const style: CSSProperties = {
    height: 35,
    borderLeft: B,
    borderBottom: B,
    display: "flex",
    justifyContent: center ? "center" : undefined,
  };
  return (
    <>
      <DivLabel header={header} style={style} />
      <DivValue data={data} style={style} />
    </>
  );
}

export function ClienteBlock({ data }: { data: AssistData }) {
  const gridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "121px 340px 1fr 135px",
  };
  return (
    <div style={{ marginTop: 10, borderTop: B, borderRight: B }}>
      <CreateGrid style={gridStyle}>
        <DivLabelAndValue header="CLIENTE:" data={data.cliente} />
        <DivLabelAndValue header="PEDIDO:" data={data.pedido} center />
      </CreateGrid>
      <CreateGrid style={gridStyle}>
        <DivLabelAndValue header="AMBIENTE:" data={data.ambiente} />
        <DivLabelAndValue header="SOLICITANTE:" data={data.solicitante} center />
      </CreateGrid>
      <CreateGrid style={gridStyle}>
        <DivLabelAndValue header="MONTAGEM:" data={data.montador} />
        <DivLabelAndValue header="RESPONSAVEL:" data={data.responsavel} center />
      </CreateGrid>
    </div>
  );
}
