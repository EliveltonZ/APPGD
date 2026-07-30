import type { AssistanceStatus } from "../../../../types/assistenciaProducao";
import { ASSISTANCE_STATUS_LABELS } from "../../../../data/assistenciaProducaoConfig";
import "./index.css";

interface Props {
  status: AssistanceStatus;
}

export function StatusBadge({ status }: Props) {
  return (
    <span
      className={`status-badge status-badge--${status.toLowerCase().replace(/ /g, "-")}`}
    >
      {ASSISTANCE_STATUS_LABELS[status]}
    </span>
  );
}
