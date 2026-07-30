export type ProjectStatus =
  | "ENTREGUE"
  | "INICIADO"
  | "ATRASADO"
  | "PARCEADO"
  | "A VENCER"
  | "URGENTE"
  | "PENDENCIA"
  | "PRONTO"
  | "AGUARDANDO";

export type StageStatus = "FINALIZADO" | "INICIADO" | "AGUARDE" | "PAUSADO";

export interface StatusProjectStages {
  corte: StageStatus;
  customizacao: StageStatus;
  coladeira: StageStatus;
  usinagem: StageStatus;
  montagem: StageStatus;
  paineis: StageStatus;
  acabamento: StageStatus;
  embalagem: StageStatus;
}

export interface StatusProjectDetail {
  numOC: string;
  cliente: string;
  contrato: string;
  cc: string;
  ambiente: string;
  nProjeto: string;
  lote: string;
  fabrica: string;
  entrega: string;
  stages: StatusProjectStages;
  previsao: string | null;
  pronto: string | null;
  entregue: string | null;
  tamanho: string;
  totalVolumes: number;
  observacoes: string;
}

export interface StatusProject {
  id: string;
  total: number;
  a: string;
  numOC: string;
  pdd: string;
  e: string;
  cc: string;
  cliente: string;
  contrato: string;
  nProjeto: string;
  ambiente: string;
  tipo: string;
  fabrica: string;
  entrega: string;
  status: ProjectStatus;
  prazo: number;
  iniciado: string | null;
  previsao: string | null;
  pronto: string | null;
  entregue: string | null;
}
