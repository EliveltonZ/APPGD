export type PendingStatus = 'pendente' | 'comprado' | 'atrasado' | 'recebido';

export interface PendingItem {
  id: number;
  categoriaId: number;  // ID usado no insert (vem do select do formulário)
  categoria: string;    // nome exibido (vem do JOIN no banco)
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
  total: number;
  atrasados: number;
  recebidos: number;
  itens: PendingItem[];
}
