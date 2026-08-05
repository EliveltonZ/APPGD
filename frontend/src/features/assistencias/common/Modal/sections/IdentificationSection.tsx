import { StatusBadge } from "../../StatusBadge";
import { SectionField } from "../SectionField";
import type { AssistanceProduction } from "../../../../../types/assistenciaProducao";

interface Props {
  data: AssistanceProduction;
  onChange: <K extends keyof AssistanceProduction>(
    key: K,
    value: AssistanceProduction[K],
  ) => void;
  readOnly?: boolean;
}

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div className="ap-read">
      <span className="ap-read__label">{label}</span>
      <span className="ap-read__value">{value || "—"}</span>
    </div>
  );
}

function StatusField({ data }: { data: AssistanceProduction }) {
  return (
    <div>
      <span
        className="ap-read__label"
        style={{ display: "block", marginBottom: 6 }}
      >
        Situação
      </span>
      <div
        style={{
          paddingTop: 4,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <StatusBadge status={data.status} />
        {data.urgente === "sim" && (
          <span className="ap-urgente-tag">Urgente</span>
        )}
      </div>
    </div>
  );
}

export function IdentificationSection({ data, onChange, readOnly }: Props) {
  return (
    <div className="ap-section">
      <h4 className="ap-section__title">Identificação</h4>
      <div className="ap-section__body">
        <StatusField data={data} />
        <div className="frow--4 ap-dates-row">
          <ReadField label="Nº Solicitação" value={data.numSolicitacao} />
          <ReadField label="Nº Contrato" value={data.numContrato} />
          <SectionField
            label="Corte"
            value={data.corte}
            onChange={(v) => onChange("corte", v)}
            readOnly={readOnly}
          />
          <SectionField
            label="Pedido"
            value={data.pedido}
            onChange={(v) => onChange("pedido", v)}
            readOnly={readOnly}
          />
        </div>

        <div className="frow--3 ap-dates-row">
          <ReadField label="Solicitante" value={data.solicitante} />
          <ReadField label="Data / Hora" value={data.dataHora} />
          <ReadField label="Prazo" value={data.prazo} />
        </div>

        <div className="frow--3 ap-dates-row">
          <div className="fcol--span2">
            <ReadField label="Cliente" value={data.cliente} />
          </div>
          <ReadField label="Ambiente" value={data.ambiente} />
        </div>
      </div>
    </div>
  );
}
