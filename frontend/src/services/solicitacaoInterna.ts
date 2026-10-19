import { apiGet, apiPost, apiDelete } from './api';

export interface SolicitacaoInternaPayload {
  material_id: number;
  quantidade: number;
  observacao: string | null;
}

// Pedido avulso de produção (ferramenta, EPI, limpeza, peça de máquina
// etc.) — nunca ligado a um pedido de venda. Cai direto em Necessidade de
// Compra pra Compras tratar junto com o resto.
export const criarSolicitacaoInterna = (payload: SolicitacaoInternaPayload): Promise<{ id: number }> =>
  apiPost('/solicitacao-interna', payload);

export interface SolicitacaoInternaPendente {
  id: number;
  material_id: number;
  quantidade: number;
  observacao: string | null;
  data_solicitacao: string;
  solicitante_login: string;
  codigo_interno: string;
  material_descricao: string;
  unidade_base: string;
}

// Pendentes — é isso que entra em Necessidade de Compra.
export const fetchSolicitacoesInternasPendentes = (): Promise<SolicitacaoInternaPendente[]> =>
  apiGet('/solicitacao-interna/pendentes');

export interface MinhaSolicitacaoInterna extends SolicitacaoInternaPendente {
  cancelada: boolean;
  atendida_em: string | null;
}

// Últimas solicitações do usuário logado, qualquer status — pra ele ver
// o que já pediu.
export const fetchMinhasSolicitacoesInternas = (): Promise<MinhaSolicitacaoInterna[]> =>
  apiGet('/solicitacao-interna/minhas');

// Cancela uma solicitação ainda pendente (não incluída em orçamento).
export const cancelarSolicitacaoInterna = (id: number): Promise<void> =>
  apiDelete(`/solicitacao-interna/${id}`);
