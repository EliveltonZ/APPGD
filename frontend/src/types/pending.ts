export type PendingStatus = 'PENDENTE' | 'RESERVADO' | 'EXECUTADO' | 'CANCELADO';
export type PendingItemTipo = 'CHAPA' | 'FITA' | 'FERRAGEM';
export type PendingItemOrigem = 'XML' | 'MANUAL';

export interface PendingItem {
  id: number;
  materialId: number;
  codigoInterno: string | null;
  descricao: string | null;
  unidade: string;
  tipo: PendingItemTipo;
  quantidade: number;
  detalhes: string | null;
  origem: PendingItemOrigem;
  status: PendingStatus;
}

export interface PendingProject {
  id: number;        // == ordemdecompra
  numOC: string;
  contrato: string;
  cliente: string;
  ambiente: string;
  entrega: string;    // yyyy-mm-dd
  total: number;
  itens: PendingItem[];
}
