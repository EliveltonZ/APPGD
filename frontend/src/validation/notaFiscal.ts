import { required } from "./rules";
import type { ValidationResult } from "./types";
import { makeResult } from "./types";

export interface NotaFiscalItemResumo {
  materialId: number | null;
  needsFator: boolean;
}

export interface NotaFiscalSubmitForm {
  fornecedorId: string;
  numeroNota: string;
  dataEntrada: string;
  itens: NotaFiscalItemResumo[];
}

// Checagem de forma antes de lançar — espelha
// backend/src/validation/NotaFiscalValidator.js. Checagens que dependem
// de estado do servidor (duplicata já lançada, localização de recebimento
// configurada) ficam de fora de propósito: não são "forma do dado", são
// regra de negócio que só o backend pode confirmar de verdade.
export function validateNotaFiscal(form: NotaFiscalSubmitForm): ValidationResult {
  const errors: Record<string, string> = {};
  const e = (f: string, msg: string | null) => { if (msg) errors[f] = msg; };

  e("fornecedorId", required(form.fornecedorId, "Fornecedor"));
  e("numeroNota", required(form.numeroNota, "Número da nota"));
  e("dataEntrada", required(form.dataEntrada, "Data de entrada"));

  if (form.itens.length === 0) {
    errors.itens = "Adicione ao menos um item.";
  } else {
    const semMaterial = form.itens.filter((i) => i.materialId == null).length;
    if (semMaterial > 0) {
      errors.itens = `${semMaterial} ite${semMaterial === 1 ? "m" : "ns"} ainda sem material associado — resolva antes de lançar.`;
    } else {
      const semFator = form.itens.filter((i) => i.needsFator).length;
      if (semFator > 0) {
        errors.itens = `${semFator} ite${semFator === 1 ? "m" : "ns"} ainda sem conversão pra estoque resolvida — resolva antes de lançar.`;
      }
    }
  }

  return makeResult(errors);
}
