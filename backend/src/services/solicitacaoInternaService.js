'use strict';
const repo = require('../repositories/solicitacaoInternaRepository');
const { SolicitacaoInternaValidator } = require('../validation');

function erro(mensagem, status, code) {
  return Object.assign(new Error(mensagem), { status, code });
}

async function criar({ materialId, quantidade, observacao, usuarioId }) {
  new SolicitacaoInternaValidator({ materialId, quantidade }).throwIfInvalid();
  const id = await repo.criar({ materialId, quantidade: Number(quantidade), observacao, usuarioId });
  return { id };
}

async function listarPendentes() {
  return repo.listarPendentes();
}

async function listarMinhas(usuarioId) {
  if (!usuarioId) throw erro('Usuário inválido.', 400, 'VALIDACAO');
  return repo.listarMinhas(usuarioId);
}

async function cancelar(id) {
  if (!id) throw erro('Solicitação inválida.', 400, 'VALIDACAO');
  const canceladaId = await repo.cancelar(id);
  return { id: canceladaId };
}

module.exports = { criar, listarPendentes, listarMinhas, cancelar };
