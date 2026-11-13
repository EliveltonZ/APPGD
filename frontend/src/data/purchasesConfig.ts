import type { Purchase, PurchaseStatus } from "../types/purchases";

export const STATUS_LABELS: Record<PurchaseStatus, string> = {
  AGUARDANDO: "Aguardando",
  PENDENCIA:  "Pendência",
  ATRASADO:   "Atrasado",
  "A VENCER": "A Vencer",
  ENTREGUE:   "Entregue",
};

export const ALL_STATUSES: PurchaseStatus[] = [
  "AGUARDANDO",
  "PENDENCIA",
  "ATRASADO",
  "A VENCER",
  "ENTREGUE",
];

export function emptyPurchase(id = 0): Purchase {
  return {
    id,
    ordemdecompra: 0,
    contrato:      0,
    cliente:       "",
    ambiente:      "",
    descricao:     "",
    categoria:     '',
    medida:        "",
    qtd:           1,
    parcelas:      1,
    cartao:        "",
    fornecedor:    "",
    chegoufabrica: "",
    entrega:       "",
    compra:        "",
    previsao:      "",
    recebido:      "",
    status:        "AGUARDANDO",
    observacoes:   "",
  };
}
