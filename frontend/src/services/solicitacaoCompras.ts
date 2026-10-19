import { apiGet, apiPost, apiPut, apiDelete } from './api';

export interface OrcamentoItem {
  material_id: number;
  quantidade: number;
}

export interface OrcamentoPayload {
  observacoes: string | null;
  itens: OrcamentoItem[];
}

export interface OrcamentoCriado {
  id: number;
  totalItens: number;
}

// Dispara um orçamento: só a lista de itens + quantidades, sem fornecedor
// nenhum — decidir quem vende cada item é feito depois, na confirmação da
// compra.
export const criarOrcamento = (payload: OrcamentoPayload): Promise<OrcamentoCriado> =>
  apiPost('/solicitacao-compras', payload);

export interface ItemOrcamentoAberto {
  id: number;
  solicitacao_id: number;
  material_id: number;
  quantidade: number;
  data_solicitacao: string;
  observacoes: string | null;
  solicitante_login: string;
  codigo_interno: string;
  material_descricao: string;
  unidade_base: string;
}

// Itens de orçamento ainda sem fornecedor confirmado.
export const fetchItensOrcamentoAbertos = (): Promise<ItemOrcamentoAberto[]> =>
  apiGet('/solicitacao-compras/itens-abertos');

// Edita a quantidade de um item ainda em orçamento — só funciona enquanto
// ele não tiver fornecedor confirmado.
export const atualizarQuantidadeOrcamento = (itemId: number, quantidade: number): Promise<{ id: number }> =>
  apiPut(`/solicitacao-compras/itens/${itemId}`, { quantidade });

// Cancela um item — de orçamento (sem fornecedor ainda) ou de pedido já
// confirmado com fornecedor. Só não funciona depois que a nota fiscal já
// vinculou esse item (chegou de verdade).
export const cancelarItemSolicitacao = (itemId: number): Promise<void> =>
  apiDelete(`/solicitacao-compras/itens/${itemId}`);

export interface ConfirmarPedidoItem {
  item_id: number;
  quantidade: number;
}

export interface ConfirmarPedidoPayload {
  fornecedor_id: number;
  observacoes: string | null;
  itens: ConfirmarPedidoItem[];
}

export interface PedidoConfirmadoItem {
  id: number;
  material_id: number;
  quantidade: number;
  fornecedor_id: number;
  data_pedido: string;
  codigo_interno: string;
  material_descricao: string;
  unidade_base: string;
  fornecedor_nome: string;
}

export interface PedidoConfirmado {
  id: number;
  data_solicitacao: string;
  observacoes: string | null;
  solicitante_login: string;
  itens: PedidoConfirmadoItem[];
}

// Confirma a compra de vários itens de orçamento de uma vez, com um único
// fornecedor — forma um pedido só. Se o fornecedor não tiver a quantidade
// toda de algum item, informe só o que ele confirmou: o restante continua
// em aberto pra outro fornecedor.
export const confirmarPedidoCompra = (payload: ConfirmarPedidoPayload): Promise<PedidoConfirmado> =>
  apiPost('/solicitacao-compras/confirmar', payload);

export type PedidoStatus = 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';

export interface PedidoItem {
  id: number;
  solicitacao_id: number;
  material_id: number;
  quantidade: number;
  data_pedido: string;
  cancelado: boolean;
  nf_item_id: number | null;
  data_solicitacao: string;
  observacoes: string | null;
  solicitante_login: string;
  codigo_interno: string;
  material_descricao: string;
  unidade_base: string;
  fornecedor_nome: string;
  status: PedidoStatus;
}

// Todo item já efetivado com fornecedor — em andamento, concluído (nota
// fiscal já vinculou) ou cancelado.
export const fetchPedidos = (): Promise<PedidoItem[]> => apiGet('/solicitacao-compras/pedidos');

export interface SolicitacaoItem {
  id: number;
  material_id: number;
  quantidade: number;
  fornecedor_id: number | null;
  data_pedido: string | null;
  codigo_interno: string;
  material_descricao: string;
  unidade_base: string;
  fornecedor_nome: string | null;
}

export interface SolicitacaoDetalhe {
  id: number;
  data_solicitacao: string;
  observacoes: string | null;
  solicitante_login: string;
  itens: SolicitacaoItem[];
}

// Cabeçalho + itens de um orçamento ou pedido — usado pra imprimir o
// orçamento e enviar aos fornecedores.
export const fetchSolicitacao = (id: number): Promise<SolicitacaoDetalhe> =>
  apiGet(`/solicitacao-compras/${id}`);

export interface PedidoAbertoPorFornecedor {
  id: number;
  material_id: number;
  quantidade: number;
  data_pedido: string;
  solicitacao_id: number;
}

// Itens de pedido já confirmados com este fornecedor, ainda sem nota
// fiscal vinculada — candidatos pra "essa linha da nota é a chegada de
// qual pedido" no lançamento da Nota Fiscal.
export const fetchPedidosAbertosPorFornecedor = (fornecedorId: number): Promise<PedidoAbertoPorFornecedor[]> =>
  apiGet('/solicitacao-compras/pedidos-abertos', { fornecedor_id: fornecedorId });
