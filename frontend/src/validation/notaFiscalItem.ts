import { required } from "./rules";
import type { ValidationResult } from "./types";
import { makeResult } from "./types";

export interface NotaFiscalItemForm {
  materialId: number | null;
  qtdNf: string;
  qtdUn: string;
  unidadeCompra: string;
  fator: string;
  precisaFator: boolean;
}

// Item sendo adicionado à nota antes de entrar na lista (formulário
// "Adicionar item"). precisaFator vem já calculado pela tela (depende do
// cadastro do material — se é controlado em metros e a unidade de compra
// não é metro, ver precisaFator() em NotaFiscal/index.tsx).
export function validateNotaFiscalItem(form: NotaFiscalItemForm): ValidationResult {
  const errors: Record<string, string> = {};
  const e = (f: string, msg: string | null) => { if (msg) errors[f] = msg; };

  e("materialId", required(form.materialId, "Material"));

  const qn = Number(form.qtdNf.replace(",", "."));
  if (!qn || qn <= 0) errors.qtdNf = "Informe a quantidade da nota.";

  const qu = Number(form.qtdUn.replace(",", "."));
  if (!qu || qu <= 0) errors.qtdUn = "Informe a quantidade em UN.";

  e("unidadeCompra", required(form.unidadeCompra, "Unidade de compra"));

  if (form.precisaFator) {
    const f = Number(form.fator.replace(",", "."));
    if (!f || f <= 0) {
      errors.fator = "Este material é controlado em metros — informe o fator de conversão (metros por rolo) antes de adicionar.";
    }
  }

  return makeResult(errors);
}
