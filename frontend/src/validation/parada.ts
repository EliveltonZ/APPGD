import { required, dateNotBefore } from "./rules";
import type { ValidationResult } from "./types";
import { makeResult } from "./types";

export interface ParadaEditForm {
  data_inicio?: string | null;
  data_fim?: string | null;
  pedido?: number;
  id_maquina?: number;
}

export function validateParadaEdit(form: ParadaEditForm): ValidationResult {
  const errors: Record<string, string> = {};
  const e = (f: string, msg: string | null) => { if (msg) errors[f] = msg; };

  e("data_inicio", required(form.data_inicio, "Data de início"));

  if (form.data_fim && form.data_inicio) {
    e("data_fim", dateNotBefore(form.data_fim, form.data_inicio, "Data de fim", "data de início"));
  }

  return makeResult(errors);
}
