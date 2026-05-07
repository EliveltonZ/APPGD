export type ProjectType    = 'plano_corte' | 'promob' | 'plano_promob';
export type ProjectStatus  = 'disponivel'  | 'em_lote' | 'em_producao' | 'concluido';

export interface ProductionProject {
  id: number;
  numOC: string;
  contrato: string;
  cliente: string;
  urgente: boolean;
  corteCC: string;
  ambiente: string;
  numProjeto: string;
  pedido: string;
  tipo: ProjectType;
  pecas: number;
  area: number;           // m²
  lote: string;
  chegouFabrica: string;  // yyyy-mm-dd
  entrega: string;        // yyyy-mm-dd
  status: ProjectStatus;
}

export interface ProjectReleaseFormData {
  numOC: string;
  contrato: string;
  cliente: string;
  urgente: boolean;
  corteCC: string;
  ambiente: string;
  numProjeto: string;
  pedido: string;
  tipo: ProjectType;
  pecas: number;
  area: number;
  lote: string;
  chegouFabrica: string;
  entrega: string;
}

export interface BatchGenerationFormData {
  lote: string;
  selectedIds: number[];
}

export interface StartBatchFormData {
  lote: string;
  dataInicio: string;
}

export interface ExportProjectsFormData {
  dataInicial: string;
  dataFinal: string;
}
