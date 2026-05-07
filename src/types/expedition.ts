export type ExpeditionStatus =
  | "aguardando"
  | "iniciado"
  | "pronto"
  | "atrasado"
  | "entregue"
  | "a_vencer";

export interface ExpeditionOrder {
  id: number;
  flagged: boolean;
  numOC: string;
  pdd: string;
  e: string;
  cc: string;
  cliente: string;
  contrato: string;
  np: string;
  ambiente: string;
  tipo: string;
  prazo: string;
  fabrica: string;
  lote: string;
  status: ExpeditionStatus;
  iniciado: string | null;
  pronto: string | null;
  entrega: string | null;
}

export interface AccessoryChecklistItem {
  id: string;
  label: string;
  conferido: boolean;
  qtd: number;
  local: string;
}

export interface VolumeSize {
  pequeno: number;
  medio: number;
  grande: number;
}

export interface PackagingStatus {
  inicio: string;
  fim: string;
  pausa: boolean;
  responsavelId: string;
  responsavelNome: string;
}

export interface OperationalStatus {
  embalagem: PackagingStatus;
  prontoData: string;
  prontoResponsavelId: string;
  prontoResponsavelNome: string;
  entregaData: string;
  entregaResponsavelId: string;
  entregaResponsavelNome: string;
  almoxarifadoDataHora: string;
  pendencias: string;
  entregaParcial: boolean;
}

export interface PendingAccessory {
  id: string;
  descricao: string;
  medida: string;
  qtd: number;
  compra: string;
  previsao: string;
  recebido: boolean;
}

export interface ExpeditionDetail {
  orderId: number;
  ordemCompra: string;
  contrato: string;
  cliente: string;
  corteCerto: boolean;
  ambiente: string;
  numeroProjeto: string;
  lote: string;
  chegouFabrica: string;
  prazo: string;
  etapaAtual: string;
  acessoriosPendentes: number;
  checklist: AccessoryChecklistItem[];
  volumes: VolumeSize;
  totalVolumes: number;
  operacional: OperationalStatus;
  observacoes: string;
  acessoriosCompra: PendingAccessory[];
}

export interface ExpeditionUser {
  id: string;
  nome: string;
}
