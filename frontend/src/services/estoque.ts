import { apiGet, apiPost, apiPut } from './api'
import type { PendingItem } from '../types/pending'

export interface Saldo {
  fisico: number
  liberado: number
  comprado: number
  solicitado: number
  disponivel: number
  saldoProjetado: number
  saldoVisibilidade: number
}

export const fetchSaldo = (materialId: number): Promise<Saldo> =>
  apiGet(`/estoque/saldo/${materialId}`)

export const definirQuantidade = (id: number, qtdUnConfirmada: number) =>
  apiPut(`/estoque/${id}/quantidade`, { qtd_un_confirmada: qtdUnConfirmada })

export const liberar = (id: number) =>
  apiPost(`/estoque/${id}/liberar`, {})

export const cancelarLiberacao = (id: number) =>
  apiPost(`/estoque/${id}/cancelar-liberacao`, {})

// Sai sempre da Fábrica pra Expedição (busca automaticamente no Almoxarifado
// se a Fábrica não tiver saldo suficiente pra esse material) — não escolhe
// localização, só a quantidade realmente consumida.
export const darBaixa = (id: number, qtd: number) =>
  apiPost(`/estoque/${id}/baixa`, { qtd_un_baixada: qtd })

export interface LiberacaoResultado {
  id: number
  ordemdecompra: number
  ok: boolean
  erro?: string
}

export interface LiberacaoLoteResumo {
  lote: number
  totalPedidos: number
  totalItens: number
  resultados: LiberacaoResultado[]
}

export interface LiberacaoPedidoResumo {
  totalItens: number
  resultados: LiberacaoResultado[]
}

export const liberarPedido = (ordemdecompra: number): Promise<LiberacaoPedidoResumo> =>
  apiPost(`/estoque/pedido/${ordemdecompra}/liberar-tudo`, {})

export const liberarLote = (ordemdecompra: number): Promise<LiberacaoLoteResumo> =>
  apiPost(`/estoque/pedido/${ordemdecompra}/liberar-lote`, {})

export interface BaixaPedidoResumo {
  totalItens: number
  resultados: { id: number; codigoInterno: string }[]
}

// Só funciona se TODO item pendente/liberado do pedido já tiver saldo físico
// de Almoxarifado suficiente — escolhe a(s) localização(ões) automaticamente.
export const baixarPedidoCompleto = (ordemdecompra: number): Promise<BaixaPedidoResumo> =>
  apiPost(`/estoque/pedido/${ordemdecompra}/baixar-tudo`, {})

// Fila do almoxarifado — tudo que já pode ser baixado agora, cruzando
// pedidos diferentes (LIBERADO de qualquer material, ou PENDENTE de
// material sem controle de estoque mínimo, que pula a liberação).
export interface EstoquePendenteItem extends PendingItem {
  ordemdecompra: number
  contrato: string
  ambiente: string
  cliente: string | null
}

export const fetchProntoParaBaixa = (): Promise<EstoquePendenteItem[]> =>
  apiGet('/estoque/pronto-para-baixa')

// Saldo real por material — "o que eu tenho em estoque", não fila de ação.
export interface SaldoMaterial {
  id: number
  codigoInterno: string
  descricao: string
  unidadeBase: string
  estoqueMinimoUn: number | null
  fisico: number
  liberado: number
  disponivel: number
  comprado: number
  solicitado: number
  saldoProjetado: number
  saldoVisibilidade: number
}

export const fetchSaldoPorMaterial = (): Promise<SaldoMaterial[]> =>
  apiGet('/estoque/saldo-materiais')

// Quebra do saldo físico por localização — consulta rápida: clicar num
// material no Estoque e ver em quais prateleiras ele está e quanto tem
// em cada uma (só retorna localização com saldo > 0).
export interface SaldoLocalizacaoItem {
  localizacao_id: number
  codigo: string
  descricao: string | null
  padrao_recebimento: boolean
  saldo: number
}

export const fetchSaldoPorLocalizacoes = (materialId: number): Promise<SaldoLocalizacaoItem[]> =>
  apiGet(`/estoque/saldo-localizacoes/${materialId}`)

// Ajuste de estoque por contagem (inventário periódico) — informa quanto
// foi contado de verdade numa localização, o backend calcula e lança a
// diferença contra o saldo atual (tipo AJUSTE em tblEstoqueMovimentos).
export const fetchSaldoLocalizacao = (materialId: number, localizacaoId: number): Promise<{ saldo: number }> =>
  apiGet(`/estoque/ajuste/saldo/${materialId}/${localizacaoId}`)

export interface AjustePayload {
  material_id: number
  localizacao_id: number
  contagem: number
  observacoes: string | null
  preco_un: number | null
}

export interface AjusteResultado {
  ajustado: boolean
  diferenca: number
  saldoAnterior: number
  saldoNovo: number
  precoAtualizado: boolean
}

export const criarAjusteEstoque = (payload: AjustePayload): Promise<AjusteResultado> =>
  apiPost('/estoque/ajuste', payload)

// Lista de Compras — só consulta, não grava nada ainda (fluxo de
// solicitação de compra não existe). Duas origens: material pedido por
// algum projeto sem saldo em NENHUMA localização, e material abaixo do
// estoque mínimo configurado.
export interface ListaComprasPedido {
  ordemdecompra: number
  contrato: string
  ambiente: string
  cliente: string | null
  urgente: boolean
  quantidade: number
  unidade: string
}

export interface ListaComprasSemEstoqueItem {
  id: number
  codigoInterno: string
  descricao: string
  unidadeBase: string
  comprado: number
  pedidos: ListaComprasPedido[]
  temUrgente: boolean
}

export interface ListaComprasAbaixoMinimoItem {
  id: number
  codigoInterno: string
  descricao: string
  unidadeBase: string
  estoqueMinimoUn: number
  fisico: number
  liberado: number
  comprado: number
  saldoProjetado: number
  temPedidoUrgente: boolean
}

export interface ListaCompras {
  semEstoque: ListaComprasSemEstoqueItem[]
  abaixoMinimo: ListaComprasAbaixoMinimoItem[]
}

export const fetchListaCompras = (): Promise<ListaCompras> =>
  apiGet('/estoque/lista-compras')

// Lista de separação física pra impressão — todo item ainda não baixado de
// um pedido, com a(s) localização(ões) de cada material, quando tem saldo
// em alguma (vazio = não tem em lugar nenhum).
export interface ListaSeparacaoLocalizacao {
  codigo: string
  saldo: number
  padraoRecebimento: boolean
}

export interface ListaSeparacaoItem {
  id: number
  codigoInterno: string
  descricao: string
  detalhes: string | null
  unidadeBase: string
  quantidade: number
  unidade: string
  status: string
  localizacoes: ListaSeparacaoLocalizacao[]
}

export interface ListaSeparacao {
  contrato: string | null
  ambiente: string | null
  cliente: string | null
  pedido: number | null
  itens: ListaSeparacaoItem[]
}

export const fetchListaSeparacao = (ordemdecompra: string | number): Promise<ListaSeparacao> =>
  apiGet(`/estoque/lista-separacao/${ordemdecompra}`)

// Histórico de ajustes de estoque — consulta: ajustes de um material
// específico, ou de um usuário específico (filtro é feito na própria
// tabela, via coluna filtrável de Material/Usuário).
export interface HistoricoAjusteItem {
  id: number
  data: string
  qtd_un: number
  observacoes: string | null
  codigo_interno: string
  material_descricao: string
  localizacao_codigo: string
  localizacao_descricao: string | null
  usuario_login: string
}

export const fetchHistoricoAjustes = (): Promise<HistoricoAjusteItem[]> =>
  apiGet('/estoque/ajuste/historico')
