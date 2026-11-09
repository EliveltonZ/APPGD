'use strict';

// Fornecedores diferentes escrevem a mesma unidade de jeitos diferentes na
// nota fiscal (ex.: LEO Madeiras manda chapa em "UN", a Arauco manda a
// mesma chapa em "M2") — normaliza pro formato canônico que o resto do
// sistema entende (UN/M2/M), pra identificação de conversão ser automática
// independente de como o fornecedor específico escreveu na nota. Variante
// desconhecida passa intacta (só trim+uppercase) — propositalmente: cai no
// fluxo de "precisa resolver manualmente" em vez de ser malinterpretada.
const SINONIMOS = {
  UN: 'UN', UND: 'UN', UNID: 'UN', UNIDADE: 'UN', UNI: 'UN', PC: 'UN', CH: 'UN', CHAPA: 'UN',
  M2: 'M2', 'M²': 'M2',
  M: 'M', MT: 'M', MTS: 'M', METRO: 'M', METROS: 'M',
};

function normalizarUnidadeCompra(raw) {
  if (raw == null) return raw;
  const limpo = String(raw).trim().toUpperCase();
  if (!limpo) return limpo;
  return SINONIMOS[limpo] ?? limpo;
}

module.exports = { normalizarUnidadeCompra };
