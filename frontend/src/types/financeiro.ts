export type MarginStatus = 'healthy' | 'medium' | 'low' | 'negative';

export type MarginFilter = 'all' | 'healthy' | 'medium' | 'low' | 'negative';

export interface ProjectValue {
  id: number;
  numOC: string;
  contrato: string;
  data: string;
  chegouFabrica: string;
  cliente: string;
  np: string;
  pedido: string;
  ambiente: string;
  bruto: number;
  negociado: number;
  material: number;
  descPct: number;
  lucroBruto: number;
  margem: number;
  marginStatus: MarginStatus;
}

export interface FinancialSummary {
  count: number;
  totalBruto: number;
  totalNegociado: number;
  totalMaterial: number;
  totalLucroBruto: number;
  margemMedia: number;
}

export interface FinanceiroFiltersState {
  search: string;
  marginFilter: MarginFilter;
}