import type { ItemAnaliseXmlLogistica } from "../services/xmlLogisticaAnaliseTemp";

// FAMILY do XML "LISTING" (Promob, pasta "xml logística") — só "Montagem"
// (peças de madeira cortadas) e "Fábrica" (ferragens de montagem: cavilha,
// minifix, tamborfix, tapa-furo...) interessam pro lançamento de peças de
// Asteca. O resto (Roteiro Produtivo = operação de corte/borda, COM =
// consumo de chapa/fita, categorias de orçamento) fica de fora.
export const FAMILIAS_RELEVANTES = new Set(["Montagem", "Fábrica"]);

export interface ItemAnaliseComCor extends ItemAnaliseXmlLogistica {
  cor: string;
}

export function filtrarMontagemFabrica<T extends ItemAnaliseXmlLogistica>(itens: T[]): T[] {
  return itens.filter((i) => i.familia != null && FAMILIAS_RELEVANTES.has(i.familia));
}

export function dimensaoTexto(i: ItemAnaliseXmlLogistica): string {
  return i.textDimension || [i.largura, i.altura, i.profundidade].filter((n) => n != null).join("x");
}

// "Chapa MDF 15mm Branco TX" / "Fita Borda PVC 0.45x22mm Grafito Chess" —
// tudo depois do "Nmm" é o nome da cor/acabamento.
const REGEX_COR = /\d+(?:[.,]\d+)?\s*mm\s+(.+)$/i;

function extrairCorDescricao(descricao: string | null): string {
  if (!descricao) return "";
  const m = descricao.match(REGEX_COR);
  return m ? m[1].trim() : "";
}

// Peça de "Montagem" (painel, base, lateral...) não carrega cor direto no
// próprio nó — ela está na chapa ou fita de borda que é filha dela
// (STRUCTUREKEY="CHAPA"/"FITA_BORDA", família "COM"), ligada pelo
// parentUniqueId. Prefere CHAPA (a face maior); cai pra FITA_BORDA só se
// não achar chapa.
export function enriquecerComCor(itens: ItemAnaliseXmlLogistica[]): ItemAnaliseComCor[] {
  const filhosPorPai = new Map<string, ItemAnaliseXmlLogistica[]>();
  for (const item of itens) {
    if (item.parentUniqueId == null) continue;
    const lista = filhosPorPai.get(item.parentUniqueId);
    if (lista) lista.push(item);
    else filhosPorPai.set(item.parentUniqueId, [item]);
  }

  return itens.map((item) => {
    if (item.familia !== "Montagem" || item.uniqueId == null) {
      return { ...item, cor: "" };
    }
    const filhos = filhosPorPai.get(item.uniqueId) ?? [];
    const chapa = filhos.find((f) => f.estruturaChave === "CHAPA")
      ?? filhos.find((f) => f.estruturaChave === "FITA_BORDA");
    return { ...item, cor: chapa ? extrairCorDescricao(chapa.descricao) : "" };
  });
}

// Mesma identidade usada na tabela de análise — só a quantidade muda de item
// pra item "igual". Ignora nível/pai/uniqueId de propósito: servem só pra
// reconstruir a árvore, não pra dizer se duas peças são a mesma coisa. Cor
// entra na chave quando presente (ItemAnaliseComCor), pra não misturar a
// mesma peça em cores diferentes num só grupo.
function chaveAgrupamento(i: ItemAnaliseXmlLogistica): string {
  const cor = (i as Partial<ItemAnaliseComCor>).cor ?? "";
  return [
    i.ambiente, i.categoria, i.componente, i.descricao, i.referencia,
    i.unidade, dimensaoTexto(i), i.familia, i.grupo, i.estruturaChave, cor,
  ].join("||");
}

export function agruparESomar<T extends ItemAnaliseXmlLogistica>(itens: T[]): T[] {
  const grupos = new Map<string, T>();
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
