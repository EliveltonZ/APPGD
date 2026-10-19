'use strict';
const repo = require('../repositories/solicitacaoComprasRepository');
const {
  OrcamentoValidator,
  ConfirmarPedidoValidator,
  AtualizarQuantidadeOrcamentoValidator,
  CancelarItemValidator,
} = require('../validation');

function erro(mensagem, status, code) {
  return Object.assign(new Error(mensagem), { status, code });
}

// Orçamento: só a lista do que precisa ser comprado, sem fornecedor ainda —
// decidir quem vende cada item vem depois, na confirmação da compra.
async function criarOrcamento({ observacoes, itens, usuarioId }) {
  new OrcamentoValidator({ itens }).throwIfInvalid();

  const id = await repo.criarOrcamento({
    observacoes,
    itens: itens.map((i) => ({ materialId: i.materialId, quantidade: Number(i.quantidade) })),
    usuarioId,
  });

  return { id, totalItens: itens.length };
}

async function listarItensAbertos() {
  return repo.listarItensAbertos();
}

async function atualizarQuantidadeItem({ itemId, quantidade }) {
  new AtualizarQuantidadeOrcamentoValidator({ itemId, quantidade }).throwIfInvalid();
  const id = await repo.atualizarQuantidadeItem({ itemId, quantidade: Number(quantidade) });
  return { id };
}

async function cancelarItem({ itemId }) {
  new CancelarItemValidator({ itemId }).throwIfInvalid();
  const id = await repo.cancelarItem(itemId);
  return { id };
}

// Confirma a compra de vários itens de orçamento de uma vez, com um único
// fornecedor, formando um pedido só — os itens selecionados não precisam
// vir todos do mesmo orçamento original.
async function confirmarPedido({ fornecedorId, observacoes, itens, usuarioId }) {
  new ConfirmarPedidoValidator({ fornecedorId, itens }).throwIfInvalid();

  const itensNormalizados = itens.map((i) => ({ itemId: i.itemId, quantidade: Number(i.quantidade) }));

  const id = await repo.confirmarPedido({ fornecedorId, observacoes, itens: itensNormalizados, usuarioId });
  return repo.buscarPedido(id);
}

// Cabeçalho + itens de uma solicitação (orçamento ou pedido) — usado pra
// imprimir o orçamento e enviar aos fornecedores.
async function buscarSolicitacao(id) {
  const solicitacao = await repo.buscarPedido(id);
  if (!solicitacao) throw erro('Orçamento não encontrado.', 404, 'NAO_ENCONTRADO');
  return solicitacao;
}

function statusItemPedido(item) {
  if (item.cancelado) return 'CANCELADO';
  if (item.nf_item_id) return 'CONCLUIDO';
  return 'EM_ANDAMENTO';
}

// Todo item já efetivado com fornecedor, com o status calculado: em
// andamento (esperando chegar), concluído (nota fiscal já vinculou) ou
// cancelado.
async function listarPedidos() {
  const itens = await repo.listarPedidos();
  return itens.map((item) => ({ ...item, status: statusItemPedido(item) }));
}

async function listarPedidosAbertosPorFornecedor(fornecedorId) {
  if (!fornecedorId) throw erro('Fornecedor inválido.', 400, 'VALIDACAO');
  return repo.listarPedidosAbertosPorFornecedor(fornecedorId);
}

module.exports = {
  criarOrcamento,
  listarItensAbertos,
  atualizarQuantidadeItem,
  cancelarItem,
  confirmarPedido,
  buscarSolicitacao,
  listarPedidos,
  listarPedidosAbertosPorFornecedor,
};
