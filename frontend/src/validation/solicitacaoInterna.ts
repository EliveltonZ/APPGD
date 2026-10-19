import { required, isPositive } from "./rules";
import type { ValidationResult } from "./types";
import { makeResult } from "./types";

export interface SolicitacaoInternaForm {
  materialId: number | null;
  quantidade: string;
}

// Espelha backend/src/validation/SolicitacaoInternaValidator.js.
export function validateSolicitacaoInterna(form: SolicitacaoInternaForm): ValidationResult {
  const errors: Record<string, string> = {};
  const e = (f: string, msg: string | null) => { if (msg) errors[f] = msg; };

  e("materialId", required(form.materialId, "Material"));
  e("quantidade", isPositive(form.quantidade, "Quantidade"));

  return makeResult(errors);
}
