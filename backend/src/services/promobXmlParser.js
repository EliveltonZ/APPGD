'use strict';
const { XMLParser } = require('fast-xml-parser');

// Tags que podem se repetir e precisam sempre virar array, mesmo com 1 ocorrência.
const TAGS_SEMPRE_ARRAY = new Set(['ITEM', 'CARACTERISTICA']);

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  isArray: (name) => TAGS_SEMPRE_ARRAY.has(name),
});

function asArray(v) {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

function numero(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

// IDs de folha reconhecidos — qualquer outro leaf com UNIDADE=UN cai em FERRAGEM
// (acessórios, dobradiças, puxadores, parafusos — tudo que é consumido em unidade inteira).
const IDS_FITA = new Set(['FITA_BORDA', 'FITA_BORDA_FER_PAI']);

function classificarFolha(item) {
  const unidade = item.UNIDADE;
  const descricao = item.DESCRICAO || '';

  if (item.ID === 'CHAPA' && unidade === 'M2') {
    if (/retalho/i.test(descricao)) return null; // sobra — fora do controle de estoque
    return 'CHAPA';
  }
  if (IDS_FITA.has(item.ID) || unidade === 'M') return 'FITA';
  if (unidade === 'UN') return 'FERRAGEM';
  return null;
}

function extrairCaracteristicas(item) {
  const lista = asArray(item.CONFIGURADO?.CARACTERISTICA);
  const map = {};
  for (const c of lista) map[c.CODIGO] = c.RESPOSTA;
  return map;
}

// Percorre recursivamente; só emite um item quando ele é folha (ESTRUTURA sem ITEM).
// Itens compostos (kits/módulos) nunca são emitidos — só seus filhos, pra não duplicar.
function percorrer(item, contexto, resultado) {
  const uniqueId = item.UNIQUE_ID;
  // MATERIAL/COR/ESPESSURA geralmente estão no item PAI (o que descreve a peça),
  // não no item-folha ID="CHAPA" em si (que normalmente tem CONFIGURADO vazio) —
  // por isso herda do contexto, só sobrescrevendo quando o nó atual define algo.
  const caractAqui = extrairCaracteristicas(item);
  const novoContexto = {
    projeto: uniqueId?.PROJECTNAME ?? contexto.projeto,
    material: caractAqui.MATERIAL ?? contexto.material,
    cor: caractAqui.COR ?? contexto.cor,
    espessura: caractAqui.ESPESSURA ?? contexto.espessura,
  };

  const filhos = asArray(item.ESTRUTURA?.ITEM);

  if (filhos.length === 0) {
    const tipo = classificarFolha(item);
    if (tipo) {
      resultado.push({
        tipo,
        descricao: item.DESCRICAO ?? '',
        referencia: item.REFERENCIA ?? '',
        unidade: item.UNIDADE ?? '',
        quantidade: numero(item.QUANTIDADE),
        material: novoContexto.material ?? null,
        cor: novoContexto.cor ?? null,
        espessura: novoContexto.espessura ?? null,
      });
    }
    return;
  }

  for (const filho of filhos) percorrer(filho, novoContexto, resultado);
}

// Agrupa linhas pela mesma referência+unidade, somando quantidade
// (a mesma peça pode se repetir várias vezes na árvore do XML).
function agrupar(itens) {
  const mapa = new Map();
  for (const it of itens) {
    const chave = `${it.tipo}|${it.referencia}|${it.unidade}`;
    if (!mapa.has(chave)) {
      mapa.set(chave, { ...it, quantidade: 0 });
    }
    mapa.get(chave).quantidade += it.quantidade;
  }
  return [...mapa.values()];
}

function parse(xmlString) {
  const doc = parser.parse(xmlString);
  const importacao = doc.XML_BUILDER?.IMPORTACAO;
  if (!importacao) {
    throw Object.assign(new Error('XML não reconhecido: estrutura IMPORTACAO não encontrada.'), {
      status: 400, code: 'VALIDACAO',
    });
  }

  const clienteLoja = importacao.DADOS_CLIENTES?.CLIENTE_LOJA ?? {};
  const cliente = { codigo: clienteLoja.CODIGO ?? null, nome: clienteLoja.NOME ?? null };

  const itensRaiz = asArray(importacao.ITENS_PEDIDO?.ITEM);
  const resultado = [];
  for (const item of itensRaiz) percorrer(item, {}, resultado);

  return { cliente, itens: agrupar(resultado) };
}

module.exports = { parse };
