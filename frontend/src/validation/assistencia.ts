import { required, isNumeric } from "./rules";
import type { ValidationResult } from "./types";
import { makeResult } from "./types";

export interface AssistenciaForm {
  numSolicitacao: string;
  numContrato: string;
  cliente: string;
  ambiente: string;
  tipoSolicitacao: string;
  destino: string;
  supervisor: string;
  liberador: string;
}

export function validateAssistencia(form: AssistenciaForm): ValidationResult {
  const errors: Record<string, string> = {};
  const e = (f: string, msg: string | null) => { if (msg) errors[f] = msg; };

  e("numSolicitacao", required(form.numSolicitacao, "Nº solicitação"));
  if (!errors.numSolicitacao)
    e("numSolicitacao", isNumeric(form.numSolicitacao, "Nº solicitação"));
  e("numContrato",     required(form.numContrato,     "Nº contrato"));
  e("cliente",         required(form.cliente,         "Cliente"));
  e("ambiente",        required(form.ambiente,        "Ambiente"));
  e("tipoSolicitacao", required(form.tipoSolicitacao, "Tipo de solicitação"));
  e("destino",         required(form.destino,         "Destino"));
  e("supervisor",      required(form.supervisor,      "Supervisor"));
  e("liberador",       required(form.liberador,       "Liberador"));

  return makeResult(errors);
}
