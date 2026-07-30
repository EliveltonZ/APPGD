import { apiGet } from './api'
import type {
  ForecastProject, ForecastStageStatus,
  ForecastProjectDetail, ForecastStageDetail, ForecastDetailStageStatus,
  ForecastProjectDetailStages,
} from '../types/forecast'

type RawRow = Record<string, unknown>

function toDateStr(val: unknown): string {
  if (!val) return ''
  return String(val).split('T')[0]
}

function toListStage(val: unknown): ForecastStageStatus {
  const s = String(val ?? 'AGUARDE')
  if (s === 'FINALIZADO' || s === 'INICIADO' || s === 'PAUSADO') return s
  return 'AGUARDE'
}

function toForecast(r: RawRow): ForecastProject {
  return {
    id:            Number(r.ordemdecompra ?? 0),
    numOC:         String(r.ordemdecompra ?? ''),
    nProjeto:      String(r.numproj ?? ''),
    pedido:        String(r.pedido ?? ''),
    urgente:       Boolean(r.urgente),
    e:             String(r.etapa ?? ''),
    corteCC:       String(r.codcc ?? ''),
    lote:          String(r.lote ?? ''),
    cliente:       String(r.cliente ?? ''),
    contrato:      String(r.contrato ?? ''),
    ambiente:      String(r.ambiente ?? ''),
    status:        (r.status as ForecastProject['status']) ?? 'INICIADO',
    entrega:       toDateStr(r.dataentrega),
    diasRestantes: Number(r.dias_restantes ?? 0),
    previsao:      toDateStr(r.previsao),
    observacoes:   String(r.observacoes ?? ''),
    total:         Number(r.total ?? 0),
    a:             String(r.a ?? ''),
    stages: {
      corte:      toListStage(r.scorte),
      custom:     toListStage(r.scustom),
      coladeira:  toListStage(r.scoladeira),
      usinagem:   toListStage(r.susinagem),
      montagem:   toListStage(r.smontagem),
      paineis:    toListStage(r.spaineis),
      separacao:  toListStage(r.sseparacao),
      acabamento: toListStage(r.sacabamento),
      embalagem:  toListStage(r.sembalagem),
    },
  }
}

function toDetailStage(
  r: RawRow,
  inicioKey: string,
  fimKey: string,
  pausaKey: string,
  nameKey: string,
): ForecastStageDetail {
  const inicio = r[inicioKey] ? String(r[inicioKey]) : ''
  const fim    = r[fimKey]    ? String(r[fimKey])    : ''
  const pausa  = Boolean(r[pausaKey])
  const status: ForecastDetailStageStatus =
    fim   ? 'concluido'   :
    pausa ? 'pausado'     :
    inicio? 'em_andamento':
            'nao_iniciado'
  return { inicio, fim, responsavel: String(r[nameKey] ?? ''), status }
}

function toForecastDetail(r: RawRow): ForecastProjectDetail {
  const stages: ForecastProjectDetailStages = {
    corte:       toDetailStage(r, 'corteinicio',       'cortefim',       'cortepausa',       'cortename'),
    customizacao:toDetailStage(r, 'customizacaoinicio', 'customizacaofim', 'customizacaopausa', 'customizacaoname'),
    coladeira:   toDetailStage(r, 'coladeirainicio',   'coladeirafim',   'coladeirapausa',   'coladeiraname'),
    usinagem:    toDetailStage(r, 'usinageminicio',     'usinagemfim',     'usinagempausa',     'usinagemname'),
    montagem:    toDetailStage(r, 'montageminicio',     'montagemfim',     'montagempausa',     'montagemname'),
    paineis:     toDetailStage(r, 'paineisinicio',      'paineisfim',      'paineispausa',      'paineisname'),
    acabamento:  toDetailStage(r, 'acabamentoinicio',   'acabamentofim',   'acabamentopausa',   'acabamentoname'),
    embalagem:   toDetailStage(r, 'embalageminicio',    'embalagemfim',    'embalagempausa',    'embalagemname'),
  }
  return {
    numOC:       String(r.ordemdecompra ?? ''),
    cliente:     String(r.cliente ?? ''),
    contrato:    String(r.contrato ?? ''),
    cc:          String(r.codcc ?? ''),
    ambiente:    String(r.ambiente ?? ''),
    nProjeto:    String(r.numproj ?? ''),
    lote:        String(r.lote ?? ''),
    fabrica:     toDateStr(r.chegoufabrica),
    entrega:     toDateStr(r.dataentrega),
    stages,
    observacoes: String(r.observacoes ?? ''),
  }
}

export async function fetchForecastProjects(): Promise<ForecastProject[]> {
  const rows = await apiGet<RawRow[]>('/previsao/')
  return rows.map(toForecast)
}

export async function fetchForecastDetail(id: number): Promise<ForecastProjectDetail | null> {
  const rows = await apiGet<RawRow[]>('/previsao/projeto', { id })
  const raw = Array.isArray(rows) ? rows[0] : null
  if (!raw) return null
  return toForecastDetail(raw)
}
