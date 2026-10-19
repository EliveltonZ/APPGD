import type { ValidationResult } from "./types";
import { makeResult } from "./types";

export interface OrcamentoItemForm {
  codigoInterno: string;
  quantidade: string;
}

// Espelha backend/src/validation/OrcamentoValidator.js — mesmas regras,
// checadas também no front antes de gastar uma chamada à API.
export function validateOrcamento(itens: OrcamentoItemForm[]): ValidationResult {
  const errors: Record<string, string> = {};

  if (itens.length === 0) {
    errors.itens = "Adicione pelo menos um item ao orçamento.";
    return makeResult(errors);
  }

  for (const item of itens) {
    const qtd = Number(item.quantidade.replace(",", "."));
    if (!qtd || qtd <= 0) {
      errors.itens = `Informe uma quantidade válida pra "${item.codigoInterno}".`;
      break;
    }
  }

  return makeResult(errors);
}
