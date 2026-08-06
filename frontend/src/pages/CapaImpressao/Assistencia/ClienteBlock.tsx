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

function DivLabelAndValue({
  header,
  data,
  start,
}: {
  header: string;
  data: string;
  start?: boolean;
}) {
  const baseStyle: CSSProperties = {
    height: 35,
    borderLeft: B,
    borderBottom: B,
    display: "flex",
  };
  return (
    <>
      <DivLabel header={header} style={baseStyle} />
      <DivValue data={data} style={{ ...baseStyle, justifyContent: start ? "start" : undefined }} />
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
        <DivLabelAndValue header="CLIENTE:" data={data.cliente} start />
        <DivLabelAndValue header="PEDIDO:" data={data.pedido} />
      </CreateGrid>
      <CreateGrid style={gridStyle}>
        <DivLabelAndValue header="AMBIENTE:" data={data.ambiente} start />
        <DivLabelAndValue header="SOLICITANTE:" data={data.solicitante} />
      </CreateGrid>
      <CreateGrid style={gridStyle}>
        <DivLabelAndValue header="MONTAGEM:" data={data.montador} />
        <DivLabelAndValue header="RESPONSAVEL:" data={data.responsavel} />
      </CreateGrid>
    </div>
  );
}
