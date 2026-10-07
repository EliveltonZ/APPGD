'use strict';
const xmlParser = require('./promobXmlParser');
const matchService = require('./promobMatchService');
const repo = require('../repositories/estoqueRepository');

function erro(mensagem, status, code) {
  return Object.assign(new Error(mensagem), { status, code });
}

// Lê o XML e tenta casar cada item com o cadastro — nada é gravado no banco
// além das consultas de leitura do casamento. O resultado vai pra tela de
// revisão: item sem materialId fica em evidência até o usuário resolver
// (trocar só aqui, ou vincular permanentemente) ou excluir a linha.
async function previsualizar(xmlString) {
  const { cliente, itens } = xmlParser.parse(xmlString);
  const casados = await matchService.casarItens(itens);
  return { cliente, itens: casados };
}

// Quantidade inicial em unidade: ferragem já vem pronta do XML (não precisa
// de conversão); chapa e fita ficam em branco — o operador informa manualmente
// quantas UN (chapas inteiras / rolos) o pedido vai usar antes de reservar.
function quantidadeUnInicial(item) {
  return item.unidade === 'UN' ? item.quantidade : null;
}

// Recebe a lista já revisada pelo usuário (toda linha com materialId
// definido — trocas e exclusões já aplicadas do lado de quem chama) e grava
// XmlImportacoes + XmlConsumo. Itens marcados com salvarVinculo também gravam
// a associação permanente referência->material.
async function confirmar({ ordemdecompra, arquivoNome, usuarioId, itens }) {
  if (!ordemdecompra) throw erro('Informe o pedido de destino da importação.', 400, 'VALIDACAO');
  if (!Array.isArray(itens) || !itens.length) {
    throw erro('Nenhum item para importar.', 400, 'VALIDACAO');
  }
  const semMaterial = itens.filter(i => !i.materialId);
  if (semMaterial.length) {
    throw erro(
      `${semMaterial.length} item(ns) ainda sem material definido — resolva ou exclua antes de concluir.`,
      400, 'VALIDACAO',
    );
  }

  for (const item of itens) {
    if (item.salvarVinculo && item.referencia) {
      await matchService.vincular(item.referencia, item.materialId, usuarioId);
    }
  }

  const totalM2 = itens
    .filter(i => i.unidade === 'M2')
    .reduce((soma, i) => soma + Number(i.quantidade || 0), 0);

  const importacao = await repo.criarImportacao({
    ordemdecompra,
    arquivoNome: arquivoNome ?? null,
    totalMateriais: itens.length,
    totalM2,
    usuarioId,
    status: 'PROCESSADO',
  });

  const rows = itens.map(item => ({
    importacaoId: importacao.id,
    ordemdecompra,
    materialId: item.materialId,
    qtdXml: item.quantidade,
    unidadeXml: item.unidade,
    qtdUnSugerida: quantidadeUnInicial(item),
    qtdUnConfirmada: quantidadeUnInicial(item),
    status: 'PENDENTE',
  }));

  await repo.criarConsumos(rows);
  return importacao;
}

module.exports = { previsualizar, confirmar };
