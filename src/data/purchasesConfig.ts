import type {
  Purchase,
  PurchaseStatus,
  PurchaseCategory,
} from "../types/purchases";

export const STATUS_LABELS: Record<PurchaseStatus, string> = {
  pendente: "Pendente",
  comprado: "Comprado",
  recebido: "Recebido",
  atrasado: "Atrasado",
};

export const CATEGORY_LABELS: Record<PurchaseCategory, string> = {
  ferragens: "Ferragens",
  madeira: "Madeira",
  acabamento: "Acabamento",
  vidro: "Vidro",
  eletrico: "Elétrico",
  outros: "Outros",
};

export const ALL_CATEGORIES: PurchaseCategory[] = [
  "ferragens",
  "madeira",
  "acabamento",
  "vidro",
  "eletrico",
  "outros",
];

export const ALL_STATUSES: PurchaseStatus[] = [
  "pendente",
  "comprado",
  "recebido",
  "atrasado",
];

export function emptyPurchase(id = 0): Purchase {
  return {
    id,
    contrato: "",
    cliente: "",
    ambiente: "",
    descricao: "",
    categoria: "outros",
    medida: "",
    qtd: 1,
    parcelas: 1,
    cartao: "",
    fornecedor: "",
    entrega: "",
    compra: "",
    previsao: "",
    recebido: "",
    status: "pendente",
    observacoes: "",
  };
}
