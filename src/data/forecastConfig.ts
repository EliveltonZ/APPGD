import type {
  StageStatus,
  ForecastProjectStatus,
  ProductionStage,
} from "../types/forecast";

export interface StageConfig {
  id: string;
  label: string;
  short: string;
}

export const FORECAST_STAGES: StageConfig[] = [
  { id: "corte", label: "Corte", short: "Crt" },
  { id: "customizacao", label: "Customização", short: "Cst" },
  { id: "coladeira", label: "Coladeira", short: "Cld" },
  { id: "usinagem", label: "Usinagem", short: "Usn" },
  { id: "painel", label: "Painel", short: "Pan" },
  { id: "montagem", label: "Montagem", short: "Mnt" },
  { id: "acabamento", label: "Acabamento", short: "Acb" },
  { id: "embalagem", label: "Embalagem", short: "Emb" },
];

export const STAGE_STATUS_LABELS: Record<StageStatus, string> = {
  nao_iniciado: "Não Iniciado",
  em_andamento: "Em Andamento",
  pausado: "Pausado",
  concluido: "Concluído",
  atrasado: "Atrasado",
};

export const FORECAST_PROJECT_STATUS_LABELS: Record<
  ForecastProjectStatus,
  string
> = {
  aguardando: "Aguardando",
  em_producao: "Em Produção",
  pausado: "Pausado",
  finalizado: "Finalizado",
  atrasado: "Atrasado",
};

export function emptyStage(): ProductionStage {
  return {
    inicio: "",
    fim: "",
    pausa: "",
    responsavel: "",
    status: "nao_iniciado",
  };
}

export function emptyStages(): Record<string, ProductionStage> {
  return Object.fromEntries(FORECAST_STAGES.map((s) => [s.id, emptyStage()]));
}
