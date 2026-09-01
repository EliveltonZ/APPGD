/**
 * Verifica se as permissões do usuário autorizam agir sobre um registro do
 * tipo informado. ASSISTENCIA aceita `nova_solicitacao` (mesma regra usada
 * no lançamento); PROJETO exige a permissão específica da operação
 * (editar_pedido / excluir_pedido).
 *
 * Precisa ser checado contra o tipo real do registro no banco — nunca
 * contra um tipo_projeto vindo do body/query, que é controlado pelo cliente.
 */
function podeAcessarTipo(permissoes, tipoProjeto, permissaoProjeto) {
  if (tipoProjeto === 'ASSISTENCIA') return !!permissoes?.nova_solicitacao;
  return !!permissoes?.[permissaoProjeto];
}

module.exports = { podeAcessarTipo };
