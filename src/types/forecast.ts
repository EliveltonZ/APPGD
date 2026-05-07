export type StageStatus =
  | "nao_iniciado"
  | "em_andamento"
  | "pausado"
  | "concluido"
  | "atrasado";

export type ForecastProjectStatus =
  | "aguardando"
  | "em_producao"
  | "pausado"
  | "finalizado"
  | "atrasado";

export interface ProductionStage {
  inicio: string;
  fim: string;
  pausa: string;
  responsavel: string;
  status: StageStatus;
}

export interface RelatedPurchase {
  id: number;
  descricao: string;
  medida: string;
  qtd: number;
  compra: string;
  previsao: string;
  recebido: string;
}

export interface ForecastProject {
  id: number;
  numOC: string;
  pedido: string;
  urgente: boolean;
  e: string;
  corteCC: string;
  lote: string;
  cliente: string;
  contrato: string;
  ambiente: string;
  status: ForecastProjectStatus;
  prazo: string;
  previsao: string;
  chegouFabrica: string;
  numProjeto: string;
  observacoes: string;
  stages: Record<string, ProductionStage>;
  materials: RelatedPurchase[];
}
