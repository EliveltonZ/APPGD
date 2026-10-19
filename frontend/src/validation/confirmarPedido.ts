import { required } from "./rules";
import type { ValidationResult } from "./types";
import { makeResult } from "./types";

export interface ConfirmarPedidoItemForm {
  codigoInterno: string;
  quantidade: string;
}

// Espelha backend/src/validation/ConfirmarPedidoValidator.js — mesmas
// regras, checadas também no front antes de gastar uma chamada à API. A
// checagem de "quantidade não pode passar do disponível" fica de fora
// daqui de propósito: depende do saldo do item (estado que só a tela tem,
// via fmtQtd pra mensagem) — o backend confere de novo de qualquer forma.
export function validateConfirmarPedido(
  fornecedorId: string,
  itens: ConfirmarPedidoItemForm[],
): ValidationResult {
  const errors: Record<string, string> = {};
  const e = (f: string, msg: string | null) => { if (msg) errors[f] = msg; };

  e("fornecedorId", required(fornecedorId, "Fornecedor"));

  if (itens.length === 0) {
    errors.itens = "Selecione ao menos um item pra confirmar.";
  } else {
    for (const item of itens) {
      const qtd = Number(item.quantidade.replace(",", "."));
      if (!qtd || qtd <= 0) {
        errors.itens = `Informe uma quantidade válida pra "${item.codigoInterno}".`;
        break;
      }
    }
  }

  return makeResult(errors);
}
