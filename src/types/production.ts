export type ProductionStatus =
  | "aguardando"
  | "iniciado"
  | "pronto"
  | "atrasado"
  | "entregue"
  | "a_vencer";

export interface ProductionOrder {
  id: number;
  flagged: boolean;
  numOC: string;
  pdd: string;
  e: string;
  cliente: string;
  contrato: string;
  np: string;
  ambiente: string;
  tipo: string;
  fabrica: string;
  prazo: string;
  lote: string;
  status: ProductionStatus;
  iniciado: string | null;
  previsao: string | null;
  pronto: string | null;
  entrega: string | null;
}

export interface SectorData {
  inicio: string;
  fim: string;
  pausa: boolean;
  responsavelId: string;
  responsavelNome: string;
}

export interface Material {
  id: string;
  descricao: string;
  medida: string;
  qtd: number;
  compra: string;
  previsao: string;
  recebido: string;
}

export interface ProductionDetail {
  orderId: number;
  ordemCompra: string;
  contrato: string;
  cliente: string;
  ambiente: string;
  numeroProjeto: string;
  lote: string;
  chegouFabrica: string;
  prazo: string;
  previsao: string;
  observacoes: string;
  setores: Record<string, SectorData>;
  materiais: Material[];
}

export interface Employee {
  id: string;
  nome: string;
}

export interface SectorConfig {
  id: string;
  label: string;
}
