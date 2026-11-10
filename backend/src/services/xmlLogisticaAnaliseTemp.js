'use strict';
const { XMLParser } = require('fast-xml-parser');

// Parser EXPLORATÓRIO/TEMPORÁRIO — só pra inspecionar o que o XML da pasta
// "xml logistica" (formato Promob "LISTING", de orçamento/produção —
// diferente do XML_BUILDER usado em Validar XML/promobXmlParser.js) traz de
// peça (ITEM com COMPONENT="Y") e dos materiais/operações dela (ITEM com
// STRUCTURE="Y", ex.: STRUCTUREKEY="CHAPA"/"FITA_BORDA"/"CORTE"). Devolve
// tudo cru, sem filtrar nada — a análise de o que é útil é manual, na tela.
//
// attributeNamePrefix precisa ser "@_" (não pode ser "") porque esse XML tem
// colisão de nome — o próprio <LISTING> tem um atributo AMBIENTS="3\0" E um
// elemento filho <AMBIENTS>; sem prefixo os dois caem na mesma chave e o
// atributo apaga o elemento.
const TAGS_SEMPRE_ARRAY = new Set(['AMBIENT', 'CATEGORY', 'ITEM']);

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  isArray: (name) => TAGS_SEMPRE_ARRAY.has(name),
});

function attr(node, name) {
  const v = node?.['@_' + name];
  return v === '' || v == null ? null : v;
}

function asArray(v) {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

function numero(v) {
  if (v === '' || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// Cada ITEM pode ter filhos em ITEMS.ITEM (peça composta usa matéria-prima e
// operações como filhos) — percorre recursivamente e devolve lista plana,
// com nível/pai pra remontar a árvore do lado da tela se precisar.
function percorrerItens(itens, ambiente, categoria, nivel, parentUniqueId, resultado) {
  for (const item of asArray(itens)) {
    resultado.push({
      ambiente,
      categoria,
      nivel,
      parentUniqueId,
      uniqueId: attr(item, 'UNIQUEID'),
      id: attr(item, 'ID'),
      descricao: attr(item, 'DESCRIPTION'),
      referencia: attr(item, 'REFERENCE'),
      unidade: attr(item, 'UNIT'),
      quantidade: numero(attr(item, 'QUANTITY')),
      repeticao: numero(attr(item, 'REPETITION')),
      largura: numero(attr(item, 'WIDTH')),
      altura: numero(attr(item, 'HEIGHT')),
      profundidade: numero(attr(item, 'DEPTH')),
      textDimension: attr(item, 'TEXTDIMENSION'),
      componente: attr(item, 'COMPONENT') === 'Y',
      estrutura: attr(item, 'STRUCTURE') === 'Y',
      estruturaChave: attr(item, 'STRUCTUREKEY'),
      familia: attr(item, 'FAMILY'),
      grupo: attr(item, 'GROUP'),
      itemBase: attr(item, 'ITEM_BASE'),
    });
    const filhos = item.ITEMS?.ITEM;
    if (filhos) percorrerItens(filhos, ambiente, categoria, nivel + 1, attr(item, 'UNIQUEID'), resultado);
  }
}

function parse(xmlString) {
  const doc = parser.parse(xmlString);
  const listing = doc.LISTING;
  if (!listing) {
    throw Object.assign(new Error('XML não reconhecido: tag LISTING não encontrada na raiz.'), {
      status: 400, code: 'VALIDACAO',
    });
  }

  const resultado = [];
  for (const ambient of asArray(listing.AMBIENTS?.AMBIENT)) {
    const ambienteDesc = attr(ambient, 'DESCRIPTION');
    for (const categoria of asArray(ambient.CATEGORIES?.CATEGORY)) {
      percorrerItens(categoria.ITEMS?.ITEM, ambienteDesc, attr(categoria, 'DESCRIPTION'), 0, null, resultado);
    }
  }

  return {
    totalNos: resultado.length,
    totalComponentes: resultado.filter((i) => i.componente).length,
    itens: resultado,
  };
}

module.exports = { parse };
