export type UrgenciaType = 'sim' | 'nao'
export type DestinoType = 'fabrica' | 'logistica'
export type TipoSolicitacaoType = 'montagem_finalizacao' | 'montagem' | 'finalizacao'

export interface SolicitacaoForm {
  numContrato: string
  cliente: string
  ambiente: string
  urgente: '' | UrgenciaType
  supervisor: string
  liberador: string
  bairro: string
  tempo: string
  tipoSolicitacao: '' | TipoSolicitacaoType
  montagem: boolean
  promob: boolean
  entrega: boolean
  cobranca: boolean
  destino: '' | DestinoType
  observacoes: string
}

export interface PecaForm {
  quantidade: string
  peca: string
  dimensoes: string
  cor: string
  lado: string
  falha: string
  tipo: string
  observacoes: string
}

export interface PecaItem extends PecaForm {
  id: string
}

export interface MontadorItem {
  id: string
  montador: string
  montadorLabel: string
}
