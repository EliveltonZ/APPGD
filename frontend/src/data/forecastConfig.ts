import type { ForecastProjectStatus } from "../types/forecast";

export interface StageConfig {
  id: string;
  label: string;
  short: string;
}

export const FORECAST_DETAIL_STAGES: StageConfig[] = [
  { id: "corte", label: "Corte", short: "Crt" },
  { id: "coladeira", label: "Coladeira", short: "Cld" },
  { id: "customizacao", label: "Customização", short: "Cst" },
  { id: "usinagem", label: "Usinagem", short: "Usn" },
  { id: "paineis", label: "Painéis", short: "Pan" },
  { id: "montagem", label: "Montagem", short: "Mnt" },
  { id: "acabamento", label: "Acabamento", short: "Acb" },
  { id: "embalagem", label: "Embalagem", short: "Emb" },
];

export const FORECAST_STAGES: StageConfig[] = [
  ...FORECAST_DETAIL_STAGES,
  { id: "separacao", label: "Separação", short: "Sep" },
];

export const FORECAST_PROJECT_STATUS_LABELS: Record<
  ForecastProjectStatus,
  string
> = {
  INICIADO: "Iniciado",
  ATRASADO: "Atrasado",
  PARCEADO: "Parceado",
  "A VENCER": "A Vencer",
  URGENTE: "Urgente",
  PENDENCIA: "Pendência",
};
