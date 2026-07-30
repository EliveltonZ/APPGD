export type OccurrenceType =
  | 'estrutural'
  | 'nao_estrutural'
  | 'acessorio'
  | 'terceiros';

export type CauseType =
  | 'projeto'
  | 'producao'
  | 'montagem'
  | 'transporte'
  | 'cliente'
  | 'fornecedor'
  | 'terceiros'
  | 'nao_identificado';

export type AnalysisStatus = 'pendente' | 'analisado';

export interface QualityItem {
  id: string;
  codigo: string;
  idAssistencia: string;
  pedido: string;
  idErp: string;
  qtd: number;
  cor: string;
  peca: string;
  dimensoes: string;
  orientacao: string;
  cliente: string;
  ambiente: string;
  supervisor: string;
  observacoes: string;

  ocorrencia: OccurrenceType | '';
  falha: string;
  causa: string;
  causaRaiz: string;
  status: AnalysisStatus;
}

export interface QualityFilters {
  search: string;
  ocorrencia: OccurrenceType | 'all';
  falha: string;
  causa: string;
  status: AnalysisStatus | 'all';
}

export interface QualitySummary {
  total: number;
  pendentes: number;
  analisados: number;
}