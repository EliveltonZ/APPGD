'use strict';
const repo = require('../repositories/estoqueRepository');

function erro(mensagem, status, code) {
  return Object.assign(new Error(mensagem), { status, code });
}

async function calcularSaldo(materialId) {
  const [fisico, reservado, comprado, solicitado] = await Promise.all([
    repo.saldoFisico(materialId),
    repo.saldoReservado(materialId),
    repo.saldoComprado(materialId),
    repo.saldoSolicitado(materialId),
  ]);
  const disponivel      = fisico - reservado;
  const saldoBloqueio   = fisico - reservado + comprado;
  const saldoVisibilidade = saldoBloqueio + solicitado;
  return { fisico, reservado, comprado, solicitado, disponivel, saldoBloqueio, saldoVisibilidade };
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
// que o pedido vai usar — só antes de reservar. Ferragem não precisa disso
// (já vem pronta do XML em unidade).
//
// Zero é um valor válido — ex.: um pedaço pequeno de chapa que já sobrou de
// outro corte, sem precisar reservar nenhuma chapa inteira pra esse item.
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

async function reservar(xmlConsumoId, usuarioId) {
  const linha = await repo.buscarXmlConsumo(xmlConsumoId);
  if (!linha) return null;
  if (linha.status !== 'PENDENTE') {
    throw erro('Só é possível reservar um item PENDENTE.', 409, 'STATUS_INVALIDO');
  }
  if (linha.qtdUnConfirmada == null) {
    throw erro('Defina a quantidade em unidade antes de reservar (pode ser zero).', 400, 'VALIDACAO');
  }
  const qtd = Number(linha.qtdUnConfirmada);

  // Reservar zero não mexe em saldo nenhum — não faz sentido gastar a
  // consulta nem arriscar barrar por "saldo insuficiente" num caso que
  // nunca precisou de saldo.
  if (qtd > 0) {
    const saldo = await calcularSaldo(linha.materialId);
    if (saldo.saldoBloqueio < qtd) {
      throw erro(
        `Saldo insuficiente para reservar (disponível com compras: ${saldo.saldoBloqueio}, necessário: ${qtd}).`,
        409, 'SALDO_INSUFICIENTE',
      );
    }
  }

  linha.status = 'RESERVADO';
  linha.dataReserva = new Date();
  linha.usuarioReservaId = usuarioId;
  await linha.save();
  return linha;
}

// Reserva uma lista de itens um por um — continua mesmo se algum falhar
// (saldo insuficiente de um material não deve travar os outros), e devolve
// o resultado de cada um pra tela mostrar o que deu certo e o que não deu.
async function reservarVarios(linhas, usuarioId) {
  const resultados = [];
  for (const linha of linhas) {
    try {
      await reservar(linha.id, usuarioId);
      resultados.push({ id: linha.id, ordemdecompra: linha.ordemdecompra, ok: true });
    } catch (err) {
      resultados.push({ id: linha.id, ordemdecompra: linha.ordemdecompra, ok: false, erro: err.message });
    }
  }
  return resultados;
}

// Trava da reserva em massa: só prossegue se TODO item PENDENTE do escopo já
// tem quantidade definida (zero conta como definida — só null bloqueia).
// Reservar em massa ignorando quem ainda falta passava despercebido; agora
// nem começa, e avisa exatamente quantos itens faltam resolver antes.
function garantirTodosComQuantidade(linhas, ondeMsg) {
  const semQtd = linhas.filter(l => l.qtdUnConfirmada == null);
  if (semQtd.length) {
    throw erro(
      `${semQtd.length} item(ns) ${ondeMsg} ainda sem quantidade definida — defina antes de reservar tudo.`,
      409, 'QUANTIDADE_PENDENTE',
    );
  }
}

// Reserva tudo que está PENDENTE num pedido só — todos precisam já ter
// quantidade em UN definida (zero vale), senão nada é reservado.
async function reservarPedido(ordemdecompra, usuarioId) {
  const linhas = await repo.listarPendentesDoPedido(ordemdecompra);
  garantirTodosComQuantidade(linhas, 'nesse pedido');
  const resultados = await reservarVarios(linhas, usuarioId);
  return { totalItens: linhas.length, resultados };
}

// Reserva tudo que está PENDENTE em TODOS os pedidos que compartilham o
// mesmo lote do pedido informado — lote é o agrupamento do Corte Certo,
// então um lote normalmente cobre vários pedidos cortados juntos.
async function reservarLote(ordemdecompraReferencia, usuarioId) {
  const lote = await repo.buscarLote(ordemdecompraReferencia);
  if (!lote) {
    throw erro('Este pedido não tem lote definido — não dá pra reservar por lote.', 400, 'VALIDACAO');
  }
  const ordens = await repo.listarOrdensDoLote(lote);
  let linhas = [];
  for (const ordemdecompra of ordens) {
    const doPedido = await repo.listarPendentesDoPedido(ordemdecompra);
    linhas = linhas.concat(doPedido.map(l => ({ id: l.id, ordemdecompra, qtdUnConfirmada: l.qtdUnConfirmada })));
  }
  garantirTodosComQuantidade(linhas, `no lote ${lote}`);
  const resultados = await reservarVarios(linhas, usuarioId);
  return { lote, totalPedidos: ordens.length, totalItens: linhas.length, resultados };
}

async function liberarReserva(xmlConsumoId) {
  const linha = await repo.buscarXmlConsumo(xmlConsumoId);
  if (!linha) return null;
  if (linha.status !== 'RESERVADO') {
    throw erro('Só é possível liberar um item RESERVADO.', 409, 'STATUS_INVALIDO');
  }
  linha.status = 'PENDENTE';
  linha.dataReserva = null;
  linha.usuarioReservaId = null;
  await linha.save();
  return linha;
}

async function darBaixa(xmlConsumoId, { qtdUnBaixada, localizacaoId, usuarioId }) {
  const linha = await repo.buscarXmlConsumo(xmlConsumoId);
  if (!linha) return null;
  if (!['PENDENTE', 'RESERVADO'].includes(linha.status)) {
    throw erro('Item já foi baixado ou está cancelado.', 409, 'STATUS_INVALIDO');
  }

  const material = await repo.buscarMaterial(linha.materialId);
  const minimoControlado = Number(material.estoqueMinimoUn) > 0;
  if (minimoControlado && linha.status !== 'RESERVADO') {
    throw erro('Este material exige reserva antes da baixa.', 409, 'RESERVA_OBRIGATORIA');
  }

  const qtd = Number(qtdUnBaixada);
  if (!qtd || qtd <= 0) {
    throw erro('Informe a quantidade realmente consumida.', 400, 'VALIDACAO');
  }
  if (!localizacaoId) {
    throw erro('Informe a localização de onde o material está saindo.', 400, 'VALIDACAO');
  }

  // Se baixar mais do que foi reservado, o excedente também precisa caber no saldo.
  const reservadoNestaLinha = linha.status === 'RESERVADO' ? Number(linha.qtdUnConfirmada) : 0;
  const excedente = qtd - reservadoNestaLinha;
  if (excedente > 0) {
    const saldo = await calcularSaldo(linha.materialId);
    if (saldo.saldoBloqueio < excedente) {
      throw erro(
        `Saldo insuficiente para a baixa (excedente sobre o reservado: ${excedente}, disponível: ${saldo.saldoBloqueio}).`,
        409, 'SALDO_INSUFICIENTE',
      );
    }
  }

  const { preco, custo } = await calcularCusto(linha, material);

  return repo.sequelize.transaction(async (t) => {
    linha.status = 'EXECUTADO';
    linha.qtdUnBaixada = qtd;
    linha.precoUnSnapshot = preco;
    linha.custoCalculado = custo;
    linha.dataBaixa = new Date();
    linha.usuarioBaixaId = usuarioId;
    await linha.save({ transaction: t });

    await repo.criarMovimento({
      materialId: linha.materialId,
      localizacaoId,
      tipo: 'BAIXA',
      qtdUn: -qtd,
      precoUn: preco,
      ordemdecompra: linha.ordemdecompra,
      xmlConsumoId: linha.id,
      usuarioId,
    }, { transaction: t });

    return linha;
  });
}

async function listarAlertaMinimo() {
  return repo.listarAbaixoDoMinimo();
}

// Saldo real por material — "o que eu tenho", não fila de ação.
async function listarSaldoPorMaterial() {
  const rows = await repo.listarSaldoPorMaterial();
  return rows.map(r => {
    const fisico = Number(r.fisico);
    const reservado = Number(r.reservado);
    const comprado = Number(r.comprado);
    const solicitado = Number(r.solicitado);
    const disponivel = fisico - reservado;
    const saldoBloqueio = disponivel + comprado;
    return {
      id: r.id,
      codigoInterno: r.codigo_interno,
      descricao: r.descricao,
      unidadeBase: r.unidade_base,
      estoqueMinimoUn: r.estoque_minimo_un != null ? Number(r.estoque_minimo_un) : null,
      fisico,
      reservado,
      disponivel,
      comprado,
      solicitado,
      saldoBloqueio,
      saldoVisibilidade: saldoBloqueio + solicitado,
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

// Saldo físico de um material numa localização — base pro ajuste por
// contagem mostrar "o sistema acha que tem X aqui" antes do usuário
// informar o que contou de verdade.
async function saldoPorLocalizacao(materialId, localizacaoId) {
  return repo.saldoPorLocalizacao(materialId, localizacaoId);
}

// Ajuste de estoque por contagem (inventário periódico) — usuário informa
// quanto contou de verdade numa localização, o sistema calcula a diferença
// contra o saldo atual e lança um único movimento tipo AJUSTE com ela (nunca
// grava a contagem em si, só a diferença, igual a qualquer outro movimento).
// Contagem igual ao saldo atual não lança nada (nada mudou).
async function ajustarEstoque({ materialId, localizacaoId, contagem, observacoes, usuarioId }) {
  if (!materialId) throw erro('Selecione o material.', 400, 'VALIDACAO');
  if (!localizacaoId) throw erro('Selecione a localização.', 400, 'VALIDACAO');
  const contagemNum = Number(contagem);
  if (!Number.isFinite(contagemNum) || contagemNum < 0) {
    throw erro('Informe a quantidade contada (zero ou mais).', 400, 'VALIDACAO');
  }

  const saldoAtual = await repo.saldoPorLocalizacao(materialId, localizacaoId);
  const diferenca = Math.round((contagemNum - saldoAtual) * 1000) / 1000;

  if (diferenca === 0) {
    return { ajustado: false, diferenca: 0, saldoAnterior: saldoAtual, saldoNovo: saldoAtual };
  }

  await repo.criarMovimento({
    materialId,
    localizacaoId,
    tipo: 'AJUSTE',
    qtdUn: diferenca,
    data: new Date(),
    usuarioId,
    observacoes: observacoes || null,
  });

  return { ajustado: true, diferenca, saldoAnterior: saldoAtual, saldoNovo: contagemNum };
}

module.exports = {
  calcularSaldo,
  definirQuantidade,
  reservar,
  reservarPedido,
  reservarLote,
  liberarReserva,
  darBaixa,
  listarAlertaMinimo,
  listarSaldoPorMaterial,
  listarProntoParaBaixa,
  saldoPorLocalizacao,
  ajustarEstoque,
};
