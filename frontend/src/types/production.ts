import type { Material } from "./common";
export type ProductionStatus =
  | "AGUARDANDO"
  | "INICIADO"
  | "PRONTO"
  | "ATRASADO"
  | "ENTREGUE"
  | "A VENCER"
  | "PARCEADO"
  | "URGENTE"
  | "PENDENCIA";

export interface ProductionOrder {
  total: number;
  a: string;
  ordemdecompra: number;
  pedido: number;
  etapa: string;
  codcc: number;
  cliente: string;
  contrato: number;
  numproj: string;
  ambiente: string;
  tipo: string;
  chegoufabrica: string | null;
  dataentrega: string | null;
  lote: number;
  status: ProductionStatus;
  iniciado: string | null;
  previsao: string | null;
  pronto: string | null;
  entrega: string | null;
  observacoes: string;
}

export interface SectorData {
  inicio: string;
  fim: string;
  pausa: boolean;
  responsavelId: string;
  responsavelNome: string;
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
