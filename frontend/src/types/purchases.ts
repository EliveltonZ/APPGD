export type PurchaseStatus =
  | "AGUARDANDO"
  | "PENDENCIA"
  | "ATRASADO"
  | "A VENCER"
  | "ENTREGUE";

export type PurchaseCategory =
  | "ferragens"
  | "madeira"
  | "acabamento"
  | "vidro"
  | "eletrico"
  | "outros";

export interface Purchase {
  id: number;
  ordemdecompra: number;
  contrato: number;
  cliente: string;
  ambiente: string;
  descricao: string;
  categoria: string;
  medida: string;
  qtd: number;
  parcelas: number;
  cartao: string; // numcard
  fornecedor: string;
  chegoufabrica: string;
  entrega: string; // dataentrega yyyy-mm-dd
  compra: string; // datacompra  yyyy-mm-dd
  previsao: string;
  recebido: string;
  status: PurchaseStatus;
  observacoes: string;
}
