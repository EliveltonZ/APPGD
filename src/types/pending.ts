export type PendingStatus = 'pendente' | 'comprado' | 'atrasado' | 'recebido';

export type PendingCategory =
  | 'ferragens'
  | 'madeira'
  | 'acabamento'
  | 'vidro'
  | 'eletrico'
  | 'outros';

export interface PendingItem {
  id: number;
  categoria: PendingCategory;
  descricao: string;
  medida: string;
  qtd: number;
  fornecedor: string;
  compra: string;    // yyyy-mm-dd | ''
  previsao: string;  // yyyy-mm-dd | ''
  recebido: string;  // yyyy-mm-dd | ''
}

export interface PendingProject {
  id: number;
  numOC: string;
  contrato: string;
  cliente: string;
  ambiente: string;
  entrega: string;   // yyyy-mm-dd
  itens: PendingItem[];
}
