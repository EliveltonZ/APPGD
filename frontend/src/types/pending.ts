export type PendingStatus = 'PENDENTE' | 'LIBERADO' | 'EXECUTADO' | 'CANCELADO';
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
  // Quantidade em UN (chapas inteiras / rolos de fita) a liberar — só
  // ferragem já nasce com isso preenchido; chapa/fita precisa ser definida
  // antes de liberar.
  qtdUnConfirmada: number | null;
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
  lote: number | null; // agrupamento do Corte Certo — null/0 = sem lote de verdade
  total: number;
  itens: PendingItem[];
}
