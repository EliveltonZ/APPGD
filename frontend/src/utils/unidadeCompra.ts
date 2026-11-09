// Espelha backend/src/utils/unidadeCompra.js — mesma normalização, mesmas
// mensagens de raciocínio. Fornecedores diferentes escrevem a mesma
// unidade de jeitos diferentes na nota (ex.: LEO Madeiras manda chapa em
// "UN", a Arauco manda a mesma chapa em "M2") — normaliza pro formato
// canônico (UN/M2/M) pra identificação de conversão ser automática
// independente de como o fornecedor escreveu. Variante desconhecida passa
// intacta (só trim+uppercase), de propósito: cai no fluxo de "precisa
// resolver manualmente" em vez de ser malinterpretada.
const SINONIMOS: Record<string, string> = {
  UN: "UN", UND: "UN", UNID: "UN", UNIDADE: "UN", UNI: "UN", PC: "UN", CH: "UN", CHAPA: "UN",
  M2: "M2", "M²": "M2",
  M: "M", MT: "M", MTS: "M", METRO: "M", METROS: "M",
};

export function normalizarUnidadeCompra(raw: string): string {
  const limpo = raw.trim().toUpperCase();
  if (!limpo) return limpo;
  return SINONIMOS[limpo] ?? limpo;
}
