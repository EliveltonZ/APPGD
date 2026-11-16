import type { ItemAnaliseXmlLogistica } from "../services/xmlLogisticaAnaliseTemp";

// FAMILY do XML "LISTING" (Promob, pasta "xml logística") relevantes pro
// lançamento de peças de Asteca: "Montagem" (peças de madeira cortadas),
// "Fábrica" (ferragens de montagem: cavilha, minifix, tamborfix, tapa-
// furo...) e "Acessórios" (item comprado avulso, ex.: fechadura, puxador).
// O resto (Roteiro Produtivo = operação de corte/borda, COM = consumo de
// chapa/fita, categorias de orçamento) fica de fora.
export const FAMILIAS_RELEVANTES = new Set(["Montagem", "Fábrica", "Acessórios"]);

export interface ItemAnaliseComCor extends ItemAnaliseXmlLogistica {
  cor: string;
}

export function filtrarFamiliasRelevantes<T extends ItemAnaliseXmlLogistica>(itens: T[]): T[] {
  return itens.filter((i) => i.familia != null && FAMILIAS_RELEVANTES.has(i.familia));
}

export function dimensaoTexto(i: ItemAnaliseXmlLogistica): string {
  return i.textDimension || [i.largura, i.altura, i.profundidade].filter((n) => n != null).join("x");
}

// "Chapa MDF 15mm Branco TX" / "Fita Borda PVC 0.45x22mm Grafito Chess" —
// tudo depois do "Nmm" é o nome da cor/acabamento. O grupo final exclui um
// "(...)" de anotação (ex.: "... 12mm (50 unid)" não é cor nenhuma) pra não
// capturar lixo de itens de ferragem que só por acaso têm "Nmm" no meio.
const REGEX_COR = /\d+(?:[.,]\d+)?\s*mm\s+([^(]+?)\s*(?:\(.*\))?$/i;

function extrairCorDescricao(descricao: string | null): string {
  if (!descricao) return "";
  const m = descricao.match(REGEX_COR);
  return m ? m[1].trim() : "";
}

// Qualquer item (de qualquer família que passe no filtro) que tiver cor
// precisa mostrar do mesmo jeito. Dois casos:
// 1. O próprio item já nomeia a cor na descrição (ex.: "Fita de Borda
//    0.45x22mm Carvalho Poro", vendida avulsa, sem filho nenhum).
// 2. A peça física (painel de "Montagem", ou peça de "Fábrica" tipo
//    Fundo/Costas cortada em MDF) não carrega cor no próprio nó — ela está
//    na chapa ou fita de borda que é filha dela (STRUCTUREKEY="CHAPA" /
//    "FITA_BORDA"/"FITA_BORDA_COMP"/"FITA_BORDA_FER", família "COM"),
//    ligada pelo parentUniqueId. Prefere CHAPA (a face maior); cai pra fita
//    de borda só se não achar chapa. Ferragem pura sem nenhum dos dois fica
//    com cor vazia mesmo.
export function enriquecerComCor(itens: ItemAnaliseXmlLogistica[]): ItemAnaliseComCor[] {
  const filhosPorPai = new Map<string, ItemAnaliseXmlLogistica[]>();
  for (const item of itens) {
    if (item.parentUniqueId == null) continue;
    const lista = filhosPorPai.get(item.parentUniqueId);
    if (lista) lista.push(item);
    else filhosPorPai.set(item.parentUniqueId, [item]);
  }

  return itens.map((item) => {
    const corPropria = extrairCorDescricao(item.descricao);
    if (corPropria) return { ...item, cor: corPropria };

    if (item.uniqueId == null) return { ...item, cor: "" };
    const filhos = filhosPorPai.get(item.uniqueId) ?? [];
    const chapa = filhos.find((f) => f.estruturaChave === "CHAPA")
      ?? filhos.find((f) => f.estruturaChave?.startsWith("FITA_BORDA"));
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
