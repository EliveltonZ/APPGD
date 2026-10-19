'use strict';
const { XMLParser } = require('fast-xml-parser');

// parseTagValue desligado de propósito — por padrão o fast-xml-parser
// converte texto "numérico" em number automaticamente, o que derruba zeros à
// esquerda (CEP "06422110" virava 6422110 → "6422110", 7 dígitos). Os poucos
// campos realmente numéricos (quantidade, preço, valor total) são
// convertidos explicitamente aqui via numero().
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  isArray: (name) => name === 'det',
  parseTagValue: false,
});

function numero(v) {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function soDigitos(v) {
  if (v == null) return null;
  const s = String(v).replace(/\D/g, '');
  return s || null;
}

function texto(v) {
  if (v == null) return null;
  const s = String(v).trim();
  return s || null;
}

// Extrai os dados relevantes de um XML de NF-e (modelo 55, padrão SEFAZ) pra
// lançamento no estoque — ignora impostos, transporte, assinatura digital e
// todo o resto que não afeta fornecedor/itens/quantidades/preços. Aceita o
// XML "processado" (<nfeProc><NFe>...) ou a NF-e avulsa (<NFe>... direto).
function parseNFeXml(xmlText) {
  let doc;
  try {
    doc = parser.parse(xmlText);
  } catch {
    throw Object.assign(new Error('Não foi possível ler o XML — arquivo inválido ou corrompido.'), { status: 400 });
  }

  const nfe = doc.nfeProc?.NFe ?? doc.NFe;
  const infNFe = nfe?.infNFe;
  if (!infNFe) {
    throw Object.assign(new Error('XML inválido — tag infNFe (NF-e) não encontrada.'), { status: 400 });
  }

  const ide = infNFe.ide ?? {};
  const emit = infNFe.emit ?? {};
  const ender = emit.enderEmit ?? {};
  const dets = infNFe.det ?? [];

  const chaveAttr = texto(infNFe['@_Id']);
  const chave = chaveAttr ? chaveAttr.replace(/^NFe/, '') : null;

  const dataEmissao = texto(ide.dhEmi)?.slice(0, 10) ?? null;
  const dataEntrada = texto(ide.dhSaiEnt)?.slice(0, 10) ?? dataEmissao;

  return {
    chave,
    numeroNota: texto(ide.nNF),
    dataEmissao,
    dataEntrada,
    valorTotal: numero(infNFe.total?.ICMSTot?.vNF),
    fornecedor: {
      cnpj: soDigitos(emit.CNPJ),
      nome: texto(emit.xNome),
      inscricaoEstadual: texto(emit.IE),
      endereco: texto(ender.xLgr),
      numero: texto(ender.nro),
      bairro: texto(ender.xBairro),
      cidade: texto(ender.xMun),
      cep: soDigitos(ender.CEP),
      estado: texto(ender.UF),
    },
    itens: dets.map((d) => {
      const p = d.prod ?? {};
      return {
        codigoNf: texto(p.cProd),
        descricao: texto(p.xProd),
        unidadeCompra: texto(p.uCom),
        qtdNf: numero(p.qCom),
        precoNf: numero(p.vUnCom),
        total: numero(p.vProd),
      };
    }),
  };
}

module.exports = { parseNFeXml };
