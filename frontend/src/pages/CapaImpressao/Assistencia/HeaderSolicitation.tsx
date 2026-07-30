import { B } from "./constants";
import { CreateGrid } from "./Grid";
import { HeaderBox } from "./HeaderBox";
import type { AssistData } from "./types";

export function HeaderSolicitation({
  data,
  urgenteClass,
}: {
  data: AssistData;
  urgenteClass: string;
}) {
  return (
    <CreateGrid
      style={{
        display: "grid",
        gridTemplateColumns: "121px 170px 170px 170px 1fr",
        marginTop: 16,
        border: B,
        borderLeft: "None",
      }}
    >
      <HeaderBox header="CORTE CERTO" value={data.corte} />
      <HeaderBox header="CONTRATO" value={data.numContrato} />
      <HeaderBox
        header="N° SOLICITAÇÃO"
        value={data.numSolicitacao}
        style={{ background: "#ffc107" }}
      />
      <HeaderBox header="DATA SOLICITAÇÃO" value={data.dataHora} />
      <HeaderBox header="URGENTE" value={data.urgente} _class={urgenteClass} />
    </CreateGrid>
  );
}
