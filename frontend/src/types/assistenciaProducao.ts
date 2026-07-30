export type AssistanceStatus =
  | 'EM ABERTO'
  | 'ESCRITORIO'
  | 'PRODUCAO'
  | 'IMPRESSO'
  | 'INICIADO'
  | 'PRONTO'
  | 'SEM MATERIAL'
  | 'PENDENCIA'
  | 'ENTREGUE';

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
  prazoDias: number | null;
  status: AssistanceStatus;
  urgente: string;          // 'sim' | 'nao'

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