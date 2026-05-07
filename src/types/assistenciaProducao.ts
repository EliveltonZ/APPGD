export type AssistanceStatus =
  | 'em_aberto'
  | 'escritorio'
  | 'producao'
  | 'iniciado'
  | 'pronto'
  | 'sem_material'
  | 'pendencia'
  | 'entregue';

export interface AssistanceTeamMember {
  id: number;
  nome: string;
}

export interface AssistanceProduction {
  id: string;
  num: number;
  numSolicitacao: string;
  numContrato: string;
  corte: string;
  pedido: string;
  cliente: string;
  ambiente: string;
  solicitante: string;
  dataHora: string;
  prazo: string;
  prazoDias: number;
  status: AssistanceStatus;
  urgente: boolean;

  supervisor: string;
  liberador: string;
  conferente: string;
  despachante: string;
  motorista: string;

  iniciado: string;
  previsao: string;
  pronto: string;

  flagEscritorio: boolean;
  flagProducao: boolean;
  flagSemMaterial: boolean;
  flagPendencia: boolean;

  entregue: string;

  obsFactory: string;
  obsLogistics: string;

  equipe: AssistanceTeamMember[];
}

export interface AssistanceFilters {
  search: string;
  prazoDias: number | '';
  status: AssistanceStatus | 'all';
  urgente: 'all' | 'sim' | 'nao';
}

export interface AssistanceSummary {
  total: number;
  emAberto: number;
  iniciadas: number;
  prontas: number;
  semMaterial: number;
  entregues: number;
}