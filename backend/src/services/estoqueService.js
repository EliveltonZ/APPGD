'use strict';
const repo = require('../repositories/estoqueRepository');
const localizacoesRepo = require('../repositories/localizacoesRepository');

function erro(mensagem, status, code) {
  return Object.assign(new Error(mensagem), { status, code });
}

async function calcularSaldo(materialId) {
  const [fisico, liberado, comprado, solicitado] = await Promise.all([
    repo.saldoFisico(materialId),
    repo.saldoLiberado(materialId),
    repo.saldoComprado(materialId),
    repo.saldoSolicitado(materialId),
  ]);
  const disponivel        = fisico - liberado;
  const saldoProjetado     = fisico - liberado + comprado;
  const saldoVisibilidade  = saldoProjetado + solicitado;
  return { fisico, liberado, comprado, solicitado, disponivel, saldoProjetado, saldoVisibilidade };
}

// Custo = quantidade do XML (m², metro ou unidade) × preço por m²/metro/unidade
// vigente na data do chegoufabrica do pedido (fallback: último preço conhecido
// do material). O fator de conversão depende do tipo:
//   M2 (chapa) -> m² por chapa inteira, fixo no cadastro do material.
//   M  (fita)  -> metros por rolo, varia por FORNECEDOR (de-para em
//                 tblMateriaisCodigoNF) — usa o fornecedor da própria compra
//                 encontrada na data do chegoufabrica.
//   UN (ferragem) -> 1 (sem conversão, já vem pronto).
async function calcularCusto(xmlConsumo, material) {
  const chegoufabrica = await repo.buscarChegouFabrica(xmlConsumo.ordemdecompra);
  const historico = await repo.buscarPrecoNaData(material.id, chegoufabrica);
  const preco = historico?.preco ?? material.ultimoPrecoUn ?? null;
  if (preco == null) return { preco: null, custo: null };

  let fatorConversao = 1;
  if (xmlConsumo.unidadeXml === 'M2') {
    fatorConversao = material.m2PorUnidade || 1;
  } else if (xmlConsumo.unidadeXml === 'M') {
    fatorConversao = await repo.buscarFatorConversaoFornecedor(material.id, historico?.fornecedorId);
    if (!fatorConversao) return { preco: Number(preco), custo: null }; // sem de-para do fornecedor, não dá pra converter com segurança
  }

  const custo = Number(xmlConsumo.qtdXml) * (Number(preco) / Number(fatorConversao));
  return { preco: Number(preco), custo };
}

// Define/edita a quantidade em unidade (chapas inteiras ou rolos de fita)
// que o pedido vai usar — só antes de liberar. Ferragem não precisa disso
// (já vem pronta do XML em unidade).
//
// Zero é um valor válido — ex.: um pedaço pequeno de chapa que já sobrou de
// outro corte, sem precisar liberar nenhuma chapa inteira pra esse item.
// Por isso o cheque é `== null`/NaN, não falsy — `!0` seria true e barraria
// exatamente o caso que precisa passar.
async function definirQuantidade(xmlConsumoId, qtdUnConfirmada) {
  const linha = await repo.buscarXmlConsumo(xmlConsumoId);
  if (!linha) return null;
  if (linha.status !== 'PENDENTE') {
    throw erro('Só é possível alterar a quantidade de um item PENDENTE.', 409, 'STATUS_INVALIDO');
  }
  const qtd = Number(qtdUnConfirmada);
  if (qtdUnConfirmada == null || Number.isNaN(qtd) || qtd < 0) {
    throw erro('Informe uma quantidade válida (zero ou mais).', 400, 'VALIDACAO');
  }
  linha.qtdUnConfirmada = qtd;
  await linha.save();
  return linha;
}

// Liberar nunca bloqueia por saldo — pedidos não disputam mais estoque entre
// si. O saldo (físico - liberado) só informa, e pode ficar negativo; quem
// decide se dá pra atender de verdade é a baixa (saída física real).
async function liberar(xmlConsumoId, usuarioId) {
  const linha = await repo.buscarXmlConsumo(xmlConsumoId);
  if (!linha) return null;
  if (linha.status !== 'PENDENTE') {
    throw erro('Só é possível liberar um item PENDENTE.', 409, 'STATUS_INVALIDO');
  }
  if (linha.qtdUnConfirmada == null) {
    throw erro('Defina a quantidade em unidade antes de liberar (pode ser zero).', 400, 'VALIDACAO');
  }

  linha.status = 'LIBERADO';
  linha.dataLiberacao = new Date();
  linha.usuarioLiberacaoId = usuarioId;
  await linha.save();
  return linha;
}

// Libera uma lista de itens um por um — como liberar nunca falha por saldo,
// só falha mesmo por item sem quantidade definida; mesmo assim mantém o
// padrão de continuar mesmo se algum item falhar, pra não travar os outros.
async function liberarVarios(linhas, usuarioId) {
  const resultados = [];
  for (const linha of linhas) {
    try {
      await liberar(linha.id, usuarioId);
      resultados.push({ id: linha.id, ordemdecompra: linha.ordemdecompra, ok: true });
    } catch (err) {
      resultados.push({ id: linha.id, ordemdecompra: linha.ordemdecompra, ok: false, erro: err.message });
    }
  }
  return resultados;
}

// Trava da liberação em massa: só prossegue se TODO item PENDENTE do escopo já
// tem quantidade definida (zero conta como definida — só null bloqueia).
// Liberar em massa ignorando quem ainda falta passava despercebido; agora
// nem começa, e avisa exatamente quantos itens faltam resolver antes.
function garantirTodosComQuantidade(linhas, ondeMsg) {
  const semQtd = linhas.filter(l => l.qtdUnConfirmada == null);
  if (semQtd.length) {
    throw erro(
      `${semQtd.length} item(ns) ${ondeMsg} ainda sem quantidade definida — defina antes de liberar tudo.`,
      409, 'QUANTIDADE_PENDENTE',
    );
  }
}

// Libera tudo que está PENDENTE num pedido só — todos precisam já ter
// quantidade em UN definida (zero vale), senão nada é liberado.
async function liberarPedido(ordemdecompra, usuarioId) {
  const linhas = await repo.listarPendentesDoPedido(ordemdecompra);
  garantirTodosComQuantidade(linhas, 'nesse pedido');
  const resultados = await liberarVarios(linhas, usuarioId);
  return { totalItens: linhas.length, resultados };
}

// Libera tudo que está PENDENTE em TODOS os pedidos que compartilham o
// mesmo lote do pedido informado — lote é o agrupamento do Corte Certo,
// então um lote normalmente cobre vários pedidos cortados juntos.
async function liberarLote(ordemdecompraReferencia, usuarioId) {
  const lote = await repo.buscarLote(ordemdecompraReferencia);
  if (!lote) {
    throw erro('Este pedido não tem lote definido — não dá pra liberar por lote.', 400, 'VALIDACAO');
  }
  const ordens = await repo.listarOrdensDoLote(lote);
  let linhas = [];
  for (const ordemdecompra of ordens) {
    const doPedido = await repo.listarPendentesDoPedido(ordemdecompra);
    linhas = linhas.concat(doPedido.map(l => ({ id: l.id, ordemdecompra, qtdUnConfirmada: l.qtdUnConfirmada })));
  }
  garantirTodosComQuantidade(linhas, `no lote ${lote}`);
  const resultados = await liberarVarios(linhas, usuarioId);
  return { lote, totalPedidos: ordens.length, totalItens: linhas.length, resultados };
}

async function cancelarLiberacao(xmlConsumoId) {
  const linha = await repo.buscarXmlConsumo(xmlConsumoId);
  if (!linha) return null;
  if (linha.status !== 'LIBERADO') {
    throw erro('Só é possível cancelar a liberação de um item LIBERADO.', 409, 'STATUS_INVALIDO');
  }
  linha.status = 'PENDENTE';
  linha.dataLiberacao = null;
  linha.usuarioLiberacaoId = null;
  await linha.save();
  return linha;
}

// Move quantidade de uma localização pra a posição única de um depósito
// (FABRICA ou EXPEDICAO), gerando o par de movimentos TRANSF_SAIDA/
// TRANSF_ENTRADA vinculado a um registro de transferência — mesmo mecanismo
// da transferência manual entre prateleiras, só que automático. `extra`
// carrega campos de rastreio (ordemdecompra, xmlConsumoId, precoUn) que vão
// iguais nos dois movimentos.
async function moverParaDeposito({ materialId, localizacaoOrigemId, deposito, qtd, usuarioId, observacoes, extra }, transaction) {
  if (!(qtd > 0)) return;
  const destino = await localizacoesRepo.buscarPorDeposito(deposito);
  if (!destino) {
    throw erro(`Localização do depósito ${deposito} não encontrada.`, 500, 'DEPOSITO_NAO_ENCONTRADO');
  }
  const data = new Date();
  const transferencia = await repo.criarTransferencia({
    materialId, localizacaoOrigemId, localizacaoDestinoId: destino.id, qtdUn: qtd, data, usuarioId,
    observacoes: observacoes || null,
  }, { transaction });
  const base = { materialId, transferenciaId: transferencia.id, data, usuarioId, observacoes: observacoes || null, ...extra };
  await repo.criarMovimento({ ...base, localizacaoId: localizacaoOrigemId, tipo: 'TRANSF_SAIDA', qtdUn: -qtd }, { transaction });
  await repo.criarMovimento({ ...base, localizacaoId: destino.id, tipo: 'TRANSF_ENTRADA', qtdUn: qtd }, { transaction });
}

// Almoxarifado → Fábrica: chamado quando um LOTE é marcado como "iniciado"
// (ver pcpRepository.atualizarIniciarLote) — move, por pedido e por
// material, a quantidade já LIBERADA (qtd_un_confirmada) pra Fábrica. O
// status do item continua LIBERADO (só desloca o saldo físico); a baixa de
// verdade (EXECUTADO) acontece depois, manualmente. Busca a quantidade em
// cada localização de Almoxarifado com saldo (maior primeiro, nunca no
// Recebimento) — se não achar o bastante, move o que der e deixa negativo
// (liberado nunca bloqueia).
async function moverPedidoParaFabrica(ordemdecompra, usuarioId, transaction) {
  const itens = await repo.listarLiberadosDoPedido(ordemdecompra);
  if (!itens.length) return;

  const recebimento = await localizacoesRepo.buscarRecebimento();
  for (const item of itens) {
    const qtd = Number(item.qtdUnConfirmada);
    if (!(qtd > 0)) continue;
    const locais = (await repo.saldoPorLocalizacoesDeposito(item.materialId, 'ALMOXARIFADO'))
      .filter((l) => !recebimento || l.localizacaoId !== recebimento.id);

    let restante = qtd;
    for (const loc of locais) {
      if (restante <= 0) break;
      const usar = Math.min(loc.saldo, restante);
      if (usar <= 0) continue;
      await moverParaDeposito({
        materialId: item.materialId,
        localizacaoOrigemId: loc.localizacaoId,
        deposito: 'FABRICA',
        qtd: usar,
        usuarioId,
        observacoes: `Lote ${ordemdecompra} iniciado`,
        extra: { ordemdecompra, xmlConsumoId: item.id },
      }, transaction);
      restante -= usar;
    }
    if (restante > 0 && locais.length) {
      // Sobrou depois de esgotar todas as localizações com saldo — tira o
      // resto da última mesmo assim (fica negativa, é só informativo).
      const ultima = locais[locais.length - 1];
      await moverParaDeposito({
        materialId: item.materialId,
        localizacaoOrigemId: ultima.localizacaoId,
        deposito: 'FABRICA',
        qtd: restante,
        usuarioId,
        observacoes: `Lote ${ordemdecompra} iniciado`,
        extra: { ordemdecompra, xmlConsumoId: item.id },
      }, transaction);
    }
  }
}

// Baixa sempre sai da Fábrica pra Expedição; se a Fábrica não tiver saldo
// suficiente pra esse material (consumo real maior que o planejado no
// iniciado), busca automaticamente o excedente no Almoxarifado (maior saldo
// primeiro, nunca no Recebimento) — nunca bloqueia, mesmo que no fim nem
// Fábrica nem Almoxarifado cubram tudo (fica negativo).
async function consumirParaExpedicao({ materialId, qtd, usuarioId, observacoes, extra }, transaction) {
  const fabrica = await localizacoesRepo.buscarPorDeposito('FABRICA');
  if (!fabrica) {
    throw erro('Localização do depósito FABRICA não encontrada.', 500, 'DEPOSITO_NAO_ENCONTRADO');
  }

  const saldoFabrica = await repo.saldoPorLocalizacao(materialId, fabrica.id);
  const daFabrica = Math.min(Math.max(saldoFabrica, 0), qtd);
  if (daFabrica > 0) {
    await moverParaDeposito({
      materialId, localizacaoOrigemId: fabrica.id, deposito: 'EXPEDICAO', qtd: daFabrica, usuarioId, observacoes, extra,
    }, transaction);
  }

  let restante = qtd - daFabrica;
  if (restante <= 0) return;

  const recebimento = await localizacoesRepo.buscarRecebimento();
  const locais = (await repo.saldoPorLocalizacoesDeposito(materialId, 'ALMOXARIFADO'))
    .filter((l) => !recebimento || l.localizacaoId !== recebimento.id);
  for (const loc of locais) {
    if (restante <= 0) break;
    const usar = Math.min(loc.saldo, restante);
    if (usar <= 0) continue;
    await moverParaDeposito({
      materialId, localizacaoOrigemId: loc.localizacaoId, deposito: 'EXPEDICAO', qtd: usar, usuarioId, observacoes, extra,
    }, transaction);
    restante -= usar;
  }
  if (restante > 0) {
    // Nem Fábrica nem Almoxarifado cobrem — sai da própria Fábrica mesmo
    // assim, só pra fechar a conta (fica negativa, é só informativo).
    await moverParaDeposito({
      materialId, localizacaoOrigemId: fabrica.id, deposito: 'EXPEDICAO', qtd: restante, usuarioId, observacoes, extra,
    }, transaction);
  }
}

async function darBaixa(xmlConsumoId, { qtd, usuarioId }) {
  const linha = await repo.buscarXmlConsumo(xmlConsumoId);
  if (!linha) return null;
  if (!['PENDENTE', 'LIBERADO'].includes(linha.status)) {
    throw erro('Item já foi baixado ou está cancelado.', 409, 'STATUS_INVALIDO');
  }

  const material = await repo.buscarMaterial(linha.materialId);
  const minimoControlado = Number(material.estoqueMinimoUn) > 0;
  if (minimoControlado && linha.status !== 'LIBERADO') {
    throw erro('Este material exige liberação antes da baixa.', 409, 'LIBERACAO_OBRIGATORIA');
  }

  const qtdTotal = Number(qtd);
  if (!qtdTotal || qtdTotal <= 0) {
    throw erro('Informe a quantidade realmente consumida.', 400, 'VALIDACAO');
  }

  const { preco, custo } = await calcularCusto(linha, material);

  return repo.sequelize.transaction(async (t) => {
    linha.status = 'EXECUTADO';
    linha.qtdUnBaixada = qtdTotal;
    linha.precoUnSnapshot = preco;
    linha.custoCalculado = custo;
    linha.dataBaixa = new Date();
    linha.usuarioBaixaId = usuarioId;
    await linha.save({ transaction: t });

    await consumirParaExpedicao({
      materialId: linha.materialId,
      qtd: qtdTotal,
      usuarioId,
      observacoes: `Baixa do pedido ${linha.ordemdecompra}`,
      extra: { precoUn: preco, ordemdecompra: linha.ordemdecompra, xmlConsumoId: linha.id },
    }, t);

    return linha;
  });
}

// Baixa em cascata: dá baixa de todo item pendente/liberado do pedido de
// uma vez, com a quantidade já confirmada de cada um — baixa nunca bloqueia
// por saldo (busca automaticamente no Almoxarifado se faltar na Fábrica),
// então só falta mesmo quantidade em UN ainda não definida (chapa/fita).
async function baixarPedidoCompleto(ordemdecompra, usuarioId) {
  const separacao = await repo.listarItensPedidoParaSeparacao(ordemdecompra);
  if (!separacao.itens.length) {
    throw erro('Não há item pendente de baixa nesse pedido.', 400, 'VALIDACAO');
  }

  const semQtd = separacao.itens.filter((i) => i.unidade !== 'UN');
  if (semQtd.length) {
    throw erro(
      `${semQtd.length} item(ns) ainda sem quantidade definida em UN — defina antes de dar baixa em cascata.`,
      409, 'QUANTIDADE_PENDENTE',
    );
  }

  const resultados = [];
  for (const item of separacao.itens) {
    await darBaixa(item.id, { qtd: item.quantidade, usuarioId });
    resultados.push({ id: item.id, codigoInterno: item.codigoInterno });
  }

  return { totalItens: resultados.length, resultados };
}

async function listarAlertaMinimo() {
  return repo.listarAbaixoDoMinimo();
}

// Lista de Compras — só informativa por enquanto, não grava nada em
// tblSolicitacaoComprasItens (esse fluxo ainda não existe). Duas origens:
// material pedido por algum projeto sem saldo em lugar nenhum, e material
// abaixo do estoque mínimo configurado.
async function listarListaCompras() {
  const [semEstoque, abaixoMinimo] = await Promise.all([
    repo.listarSemEstoqueParaPedidos(),
    repo.listarAbaixoDoMinimo(),
  ]);
  return { semEstoque, abaixoMinimo };
}

// Saldo real por material — "o que eu tenho", não fila de ação.
async function listarSaldoPorMaterial() {
  const rows = await repo.listarSaldoPorMaterial();
  return rows.map(r => {
    const fisico = Number(r.fisico);
    const liberado = Number(r.liberado);
    const comprado = Number(r.comprado);
    const solicitado = Number(r.solicitado);
    const disponivel = fisico - liberado;
    const saldoProjetado = disponivel + comprado;
    return {
      id: r.id,
      codigoInterno: r.codigo_interno,
      descricao: r.descricao,
      unidadeBase: r.unidade_base,
      estoqueMinimoUn: r.estoque_minimo_un != null ? Number(r.estoque_minimo_un) : null,
      fisico,
      liberado,
      disponivel,
      comprado,
      solicitado,
      saldoProjetado,
      saldoVisibilidade: saldoProjetado + solicitado,
    };
  });
}

// Fila do almoxarifado: tudo que já pode ser baixado agora, cruzando pedidos
// diferentes (ao contrário de "Itens Pedido", que é por um pedido só).
const TIPO_POR_UNIDADE = { M2: 'CHAPA', M: 'FITA', UN: 'FERRAGEM' };

async function listarProntoParaBaixa() {
  const rows = await repo.listarProntosParaBaixa();
  return rows.map(r => ({
    id: r.id,
    ordemdecompra: r.ordemdecompra,
    materialId: r.material_id,
    codigoInterno: r.codigo_interno,
    descricao: r.descricao,
    unidade: r.unidade_xml,
    tipo: TIPO_POR_UNIDADE[r.unidade_xml] ?? 'FERRAGEM',
    quantidade: r.qtd_xml != null ? Number(r.qtd_xml) : null,
    qtdUnConfirmada: r.qtd_un_confirmada != null ? Number(r.qtd_un_confirmada) : null,
    detalhes: r.detalhes,
    status: r.status,
    origem: r.importacao_id != null ? 'XML' : 'MANUAL',
    contrato: r.contrato,
    ambiente: r.ambiente,
    cliente: r.cliente,
  }));
}

// Tudo que ainda não foi baixado, de todo pedido em aberto — base da tela
// de Compras pra decidir o que liberar (sem filtro de estoque mínimo, ao
// contrário da fila de baixa do almoxarifado).
async function listarPendentesOuLiberadosGeral() {
  const rows = await repo.listarPendentesOuLiberadosGeral();
  return rows.map(r => ({
    id: r.id,
    ordemdecompra: r.ordemdecompra,
    materialId: r.material_id,
    codigoInterno: r.codigo_interno,
    descricao: r.descricao,
    unidade: r.unidade_xml,
    tipo: TIPO_POR_UNIDADE[r.unidade_xml] ?? 'FERRAGEM',
    quantidade: r.qtd_xml != null ? Number(r.qtd_xml) : null,
    qtdUnConfirmada: r.qtd_un_confirmada != null ? Number(r.qtd_un_confirmada) : null,
    detalhes: r.detalhes,
    status: r.status,
    origem: r.importacao_id != null ? 'XML' : 'MANUAL',
    contrato: r.contrato,
    ambiente: r.ambiente,
    lote: r.lote || null,
    cliente: r.cliente,
  }));
}

// Lista de separação física pra impressão — todo item ainda não baixado de
// um pedido, com a localização de cada material (quando tem saldo em
// alguma), pro almoxarifado ir atrás fisicamente.
async function listarItensPedidoParaSeparacao(ordemdecompra) {
  return repo.listarItensPedidoParaSeparacao(ordemdecompra);
}

// Saldo físico de um material numa localização — base pro ajuste por
// contagem mostrar "o sistema acha que tem X aqui" antes do usuário
// informar o que contou de verdade.
async function saldoPorLocalizacao(materialId, localizacaoId) {
  return repo.saldoPorLocalizacao(materialId, localizacaoId);
}

// Quebra do saldo físico por localização — consulta rápida do Estoque.
async function saldoPorLocalizacoes(materialId) {
  return repo.saldoPorLocalizacoes(materialId);
}

// Ajuste de estoque por contagem (inventário periódico) — usuário informa
// quanto contou de verdade numa localização, o sistema calcula a diferença
// contra o saldo atual e lança um único movimento tipo AJUSTE com ela (nunca
// grava a contagem em si, só a diferença, igual a qualquer outro movimento).
// Contagem igual ao saldo atual não lança nada (nada mudou).
//
// precoUn é opcional: inventário inicial de item sem nenhuma nota fiscal
// (nunca comprado pelo sistema) não tem de onde puxar custo — sem isso,
// qualquer pedido que use esse material fica com custo nulo pra sempre.
// Quando informado, grava no próprio movimento (preço vigente nesse
// instante) e também atualiza material.ultimoPrecoUn/dataUltimoPreco —
// mesma regra de "só sobrescreve se mais novo" já usada pra preço de NF,
// então uma nota fiscal real posterior sempre pode corrigir essa
// estimativa inicial.
async function ajustarEstoque({ materialId, localizacaoId, contagem, observacoes, precoUn, usuarioId }) {
  if (!materialId) throw erro('Selecione o material.', 400, 'VALIDACAO');
  if (!localizacaoId) throw erro('Selecione a localização.', 400, 'VALIDACAO');
  const contagemNum = Number(contagem);
  if (!Number.isFinite(contagemNum) || contagemNum < 0) {
    throw erro('Informe a quantidade contada (zero ou mais).', 400, 'VALIDACAO');
  }

  let precoUnNum = null;
  if (precoUn != null && String(precoUn).trim() !== '') {
    precoUnNum = Number(precoUn);
    if (!Number.isFinite(precoUnNum) || precoUnNum <= 0) {
      throw erro('Informe um preço unitário válido (maior que zero).', 400, 'VALIDACAO');
    }
  }

  const saldoAtual = await repo.saldoPorLocalizacao(materialId, localizacaoId);
  const diferenca = Math.round((contagemNum - saldoAtual) * 1000) / 1000;
  const agora = new Date();

  if (diferenca === 0 && precoUnNum == null) {
    return { ajustado: false, diferenca: 0, saldoAnterior: saldoAtual, saldoNovo: saldoAtual, precoAtualizado: false };
  }

  if (diferenca !== 0) {
    await repo.criarMovimento({
      materialId,
      localizacaoId,
      tipo: 'AJUSTE',
      qtdUn: diferenca,
      precoUn: precoUnNum,
      data: agora,
      usuarioId,
      observacoes: observacoes || null,
    });
  }

  if (precoUnNum != null) {
    await repo.atualizarPrecoSeMaisNovo(materialId, precoUnNum, agora);
  }

  return {
    ajustado: diferenca !== 0,
    diferenca,
    saldoAnterior: saldoAtual,
    saldoNovo: contagemNum,
    precoAtualizado: precoUnNum != null,
  };
}

// Histórico de ajustes — consulta: todos os ajustes de um material, ou
// todos os ajustes feitos por um usuário (filtro fica no front, aqui só
// traz tudo com material/localização/usuário já resolvidos).
async function listarHistoricoAjustes() {
  return repo.listarHistoricoAjustes();
}

module.exports = {
  calcularSaldo,
  definirQuantidade,
  liberar,
  liberarPedido,
  liberarLote,
  cancelarLiberacao,
  darBaixa,
  baixarPedidoCompleto,
  moverPedidoParaFabrica,
  listarAlertaMinimo,
  listarListaCompras,
  listarSaldoPorMaterial,
  listarProntoParaBaixa,
  listarPendentesOuLiberadosGeral,
  listarItensPedidoParaSeparacao,
  saldoPorLocalizacao,
  saldoPorLocalizacoes,
  ajustarEstoque,
  listarHistoricoAjustes,
};
