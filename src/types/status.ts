export type StageStatus =
  | 'nao_iniciado'
  | 'em_andamento'
  | 'pausado'
  | 'concluido'
  | 'atrasado'

export type ProjectStatus =
  | 'aguardando'
  | 'em_producao'
  | 'concluido'
  | 'atrasado'

export type ProjectIndicator = 'ok' | 'pendente' | 'atrasado'

export type StageName =
  | 'corte'
  | 'customizacao'
  | 'coladeira'
  | 'usinagem'
  | 'paineis'
  | 'montagem'
  | 'acabamento'
  | 'embalagem'

export interface StatusProductionStage {
  status: StageStatus
  inicio: string
  fim: string
  responsavel: string
  pausa?: string
}

export interface StatusRelatedPurchase {
  id: string
  descricao: string
  medida: string
  qtd: number
  compra: string
  previsao: string
  recebido: boolean
}

export interface StatusProject {
  id: string
  numero: number
  indicador: ProjectIndicator
  numOC: string
  pdd: string
  e: string
  cc: string
  cliente: string
  contrato: string
  nProjeto: string
  ambiente: string
  tipo: string
  fabrica: string
  entrega: string
  prazo: string
  status: ProjectStatus
  iniciado: string | null
  previsao: string | null
  pronto: string | null
  entregue: string | null
  lote: string
  chegouFabrica: string
  observacoes: string
  stages: Record<StageName, StatusProductionStage>
  compras: StatusRelatedPurchase[]
}
