import { required, isPositive, dateNotBefore } from "./rules";
import type { Purchase } from "../types/purchases";
import type { ValidationResult } from "./types";
import { makeResult } from "./types";

export function validateCompra(form: Purchase): ValidationResult {
  const errors: Record<string, string> = {};
  const e = (f: string, msg: string | null) => { if (msg) errors[f] = msg; };

  e("descricao",  required(form.descricao,  "Descrição"));
  e("fornecedor", required(form.fornecedor, "Fornecedor"));
  e("qtd",        isPositive(form.qtd,      "Quantidade"));

  if (form.compra && form.entrega)
    e("entrega", dateNotBefore(form.entrega, form.compra, "Data de entrega", "data da compra"));

  return makeResult(errors);
}
