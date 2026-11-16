import type { ItemAnaliseXmlLogistica } from "../services/xmlLogisticaAnaliseTemp";

// FAMILY do XML "LISTING" (Promob, pasta "xml logística") — só "Montagem"
// (peças de madeira cortadas) e "Fábrica" (ferragens de montagem: cavilha,
// minifix, tamborfix, tapa-furo...) interessam pro lançamento de peças de
// Asteca. O resto (Roteiro Produtivo = operação de corte/borda, COM =
// consumo de chapa/fita, categorias de orçamento) fica de fora.
export const FAMILIAS_RELEVANTES = new Set(["Montagem", "Fábrica"]);

export function filtrarMontagemFabrica(
  itens: ItemAnaliseXmlLogistica[],
): ItemAnaliseXmlLogistica[] {
  return itens.filter((i) => i.familia != null && FAMILIAS_RELEVANTES.has(i.familia));
}

export function dimensaoTexto(i: ItemAnaliseXmlLogistica): string {
  return i.textDimension || [i.largura, i.altura, i.profundidade].filter((n) => n != null).join("x");
}

// Mesma identidade usada na tabela de análise — só a quantidade muda de item
// pra item "igual". Ignora nível/pai/uniqueId de propósito: servem só pra
// reconstruir a árvore, não pra dizer se duas peças são a mesma coisa.
function chaveAgrupamento(i: ItemAnaliseXmlLogistica): string {
  return [
    i.ambiente, i.categoria, i.componente, i.descricao, i.referencia,
    i.unidade, dimensaoTexto(i), i.familia, i.grupo, i.estruturaChave,
  ].join("||");
}

export function agruparESomar(
  itens: ItemAnaliseXmlLogistica[],
): ItemAnaliseXmlLogistica[] {
  const grupos = new Map<string, ItemAnaliseXmlLogistica>();
  for (const item of itens) {
    const chave = chaveAgrupamento(item);
    const existente = grupos.get(chave);
    if (existente) {
      existente.quantidade = (existente.quantidade ?? 0) + (item.quantidade ?? 0);
    } else {
      grupos.set(chave, { ...item });
    }
  }
  return [...grupos.values()];
}
