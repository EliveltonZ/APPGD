import { apiGet } from './api'
import type {
  StatusProject,
  StatusProjectDetail,
  StatusProjectDetailStages,
  StatusStageDetail,
} from '../types/status'

type RawRow = Record<string, unknown>

function toDateStr(val: unknown): string {
  if (!val) return ''
  return String(val).split('T')[0]
}

function toDetailStage(r: RawRow, inicioKey: string, fimKey: string): StatusStageDetail {
  const inicio = r[inicioKey] ? String(r[inicioKey]) : ''
  const fim    = r[fimKey]    ? String(r[fimKey])    : ''
  return {
    inicio,
    fim,
    status: fim ? 'concluido' : inicio ? 'em_andamento' : 'nao_iniciado',
  }
}

function toStatusProject(r: RawRow): StatusProject {
  return {
    id:       String(r.ordemdecompra ?? ''),
    total:    Number(r.total ?? 0),
    a:        String(r.a ?? ''),
    numOC:    String(r.ordemdecompra ?? ''),
    pdd:      String(r.pedido ?? ''),
    e:        String(r.etapa ?? ''),
    cc:       String(r.codcc ?? ''),
    cliente:  String(r.cliente ?? ''),
    contrato: String(r.contrato ?? ''),
    nProjeto: String(r.numproj ?? ''),
    ambiente: String(r.ambiente ?? ''),
    tipo:     String(r.tipo ?? ''),
    fabrica:  toDateStr(r.chegoufabrica),
    entrega:  toDateStr(r.dataentrega),
    status:   (r.status as StatusProject['status']) ?? 'AGUARDANDO',
    prazo:    Number(r.prazo ?? 0),
    iniciado: toDateStr(r.iniciado) || null,
    previsao: toDateStr(r.previsao) || null,
    pronto:   toDateStr(r.pronto) || null,
    entregue: toDateStr(r.entrega) || null,
  }
}

function toStatusProjectDetail(r: RawRow): StatusProjectDetail {
  const stages: StatusProjectDetailStages = {
    corte:        toDetailStage(r, 'corteinicio',        'cortefim'),
    customizacao: toDetailStage(r, 'customizacaoinicio', 'customizacaofim'),
    coladeira:    toDetailStage(r, 'coladeirainicio',    'coladeirafim'),
    usinagem:     toDetailStage(r, 'usinageminicio',     'usinagemfim'),
    montagem:     toDetailStage(r, 'montageminicio',     'montagemfim'),
    paineis:      toDetailStage(r, 'paineisinicio',      'paineisfim'),
    acabamento:   toDetailStage(r, 'acabamentoinicio',   'acabamentofim'),
    embalagem:    toDetailStage(r, 'embalageminicio',    'embalagemfim'),
  }
  return {
    numOC:        String(r.ordemdecompra ?? ''),
    cliente:      String(r.cliente ?? ''),
    contrato:     String(r.contrato ?? ''),
    cc:           String(r.codcc ?? ''),
    ambiente:     String(r.ambiente ?? ''),
    nProjeto:     String(r.numproj ?? ''),
    lote:         String(r.lote ?? ''),
    fabrica:      toDateStr(r.chegoufabrica),
    entrega:      toDateStr(r.dataentrega),
    stages,
    previsao:     toDateStr(r.previsao) || null,
    pronto:       toDateStr(r.pronto) || null,
    entregue:     toDateStr(r.entrega) || null,
    tamanho:      String(r.tamanho ?? ''),
    totalVolumes: Number(r.totalvolumes ?? 0),
    observacoes:  String(r.observacoes ?? ''),
  }
}

export async function fetchStatusProjects(dataCondition: string): Promise<StatusProject[]> {
  const rows = await apiGet<RawRow[]>('/status/', { dataCondition })
  return rows.map(toStatusProject)
}

export async function fetchStatusDetail(id: string): Promise<StatusProjectDetail | null> {
  const rows = await apiGet<RawRow[]>('/status/projeto', { id })
  const raw = Array.isArray(rows) ? rows[0] : null
  if (!raw) return null
  return toStatusProjectDetail(raw)
}
