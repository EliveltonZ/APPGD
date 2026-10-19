'use strict';
const { QueryTypes } = require('sequelize');
const { sequelize, SolicitacaoInterna } = require('../client/db');

// Pedido avulso de produção — ferramenta, EPI, limpeza, peça de máquina
// etc. — nunca ligado a um pedido de venda. Data sempre do servidor
// (nunca vinda do cliente), mesmo princípio anti-adulteração já usado em
// baixas/ajustes/transferências.
async function criar({ materialId, quantidade, observacao, usuarioId }) {
  const solicitacao = await SolicitacaoInterna.create({
    materialId,
    quantidade,
    usuarioId,
    observacao: observacao || null,
    cancelada: false,
  });
  return solicitacao.id;
}

// Pendentes (não canceladas, ainda não atendidas por nenhum orçamento) —
// é isso que aparece em Necessidade de Compra.
async function listarPendentes() {
  return sequelize.query(
    `SELECT si.id, si.material_id, si.quantidade, si.observacao, si.data_solicitacao,
            u.login AS solicitante_login,
            m.codigo_interno, m.descricao AS material_descricao, m.unidade_base
     FROM "tblSolicitacaoInterna" si
     JOIN "tblMateriais" m ON m.id = si.material_id
     JOIN "tblUsuario" u   ON u.id = si.usuario_id
     WHERE si.cancelada = false AND si.atendida_em IS NULL
     ORDER BY m.codigo_interno ASC, si.data_solicitacao ASC`,
    { type: QueryTypes.SELECT },
  );
}

// Últimas solicitações de um usuário (qualquer status) — pra ele ver o
// que já pediu, sem precisar abrir uma tela de administração.
async function listarMinhas(usuarioId) {
  return sequelize.query(
    `SELECT si.id, si.material_id, si.quantidade, si.observacao, si.data_solicitacao,
            si.cancelada, si.atendida_em,
            u.login AS solicitante_login,
            m.codigo_interno, m.descricao AS material_descricao, m.unidade_base
     FROM "tblSolicitacaoInterna" si
     JOIN "tblMateriais" m ON m.id = si.material_id
     JOIN "tblUsuario" u   ON u.id = si.usuario_id
     WHERE si.usuario_id = :usuarioId
     ORDER BY si.data_solicitacao DESC
     LIMIT 50`,
    { replacements: { usuarioId }, type: QueryTypes.SELECT },
  );
}

// Cancela uma solicitação ainda pendente — mesma regra de todo item de
// compra nesta sessão: só enquanto não tiver sido atendida (entrado num
// orçamento).
async function cancelar(id) {
  const solicitacao = await SolicitacaoInterna.findByPk(id);
  if (!solicitacao || solicitacao.cancelada) {
    throw Object.assign(new Error('Solicitação não encontrada.'), { status: 404 });
  }
  if (solicitacao.atendidaEm) {
    throw Object.assign(new Error('Esta solicitação já foi incluída num orçamento, não pode mais cancelar.'), { status: 400 });
  }
  solicitacao.cancelada = true;
  await solicitacao.save();
  return solicitacao.id;
}

module.exports = { criar, listarPendentes, listarMinhas, cancelar };
