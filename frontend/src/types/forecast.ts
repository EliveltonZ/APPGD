export type ForecastDetailStageStatus =
  | "nao_iniciado"
  | "em_andamento"
  | "pausado"
  | "concluido";

export interface ForecastStageDetail {
  inicio: string;
  fim: string;
  responsavel: string;
  status: ForecastDetailStageStatus;
}

export interface ForecastProjectDetailStages {
  corte: ForecastStageDetail;
  customizacao: ForecastStageDetail;
  coladeira: ForecastStageDetail;
  usinagem: ForecastStageDetail;
  montagem: ForecastStageDetail;
  paineis: ForecastStageDetail;
  acabamento: ForecastStageDetail;
  embalagem: ForecastStageDetail;
}

export interface ForecastProjectDetail {
  numOC: string;
  cliente: string;
  contrato: string;
  cc: string;
  ambiente: string;
  nProjeto: string;
  lote: string;
  fabrica: string;
  entrega: string;
  stages: ForecastProjectDetailStages;
  observacoes: string;
}

export type ForecastProjectStatus =
  | "INICIADO"
  | "ATRASADO"
  | "PARCEADO"
  | "A VENCER"
  | "URGENTE"
  | "PENDENCIA";

export type ForecastStageStatus =
  | "FINALIZADO"
  | "INICIADO"
  | "AGUARDE"
  | "PAUSADO";

export interface ForecastProjectStages {
  corte: ForecastStageStatus;
  custom: ForecastStageStatus;
  coladeira: ForecastStageStatus;
  usinagem: ForecastStageStatus;
  montagem: ForecastStageStatus;
  paineis: ForecastStageStatus;
  separacao: ForecastStageStatus;
  acabamento: ForecastStageStatus;
  embalagem: ForecastStageStatus;
}

export interface ForecastProject {
  id: number;
  numOC: string;
  nProjeto: string;
  pedido: string;
  urgente: boolean;
  e: string;
  corteCC: string;
  lote: string;
  cliente: string;
  contrato: string;
  ambiente: string;
  status: ForecastProjectStatus;
  entrega: string;
  diasRestantes: number;
  previsao: string;
  observacoes: string;
  total: number;
  a: string;
  stages: ForecastProjectStages;
}
