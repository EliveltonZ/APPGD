export type PurchaseStatus = "pendente" | "comprado" | "recebido" | "atrasado";

export type PurchaseCategory =
  | "ferragens"
  | "madeira"
  | "acabamento"
  | "vidro"
  | "eletrico"
  | "outros";

export interface Purchase {
  id: number;
  contrato: string;
  cliente: string;
  ambiente: string;
  descricao: string;
  categoria: PurchaseCategory;
  medida: string;
  qtd: number;
  parcelas: number;
  cartao: string;
  fornecedor: string;
  entrega: string; // yyyy-mm-dd
  compra: string; // yyyy-mm-dd | ''
  previsao: string; // yyyy-mm-dd | ''
  recebido: string; // yyyy-mm-dd | ''
  status: PurchaseStatus;
  observacoes: string;
}
