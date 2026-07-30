import { apiGet } from './api'
import type { StatusProject, StatusProjectDetail, StageStatus } from '../types/status'

type RawRow = Record<string, unknown>

function toDateStr(val: unknown): string {
  if (!val) return ''
  return String(val).split('T')[0]
}

function toStage(val: unknown): StageStatus {
  const s = String(val ?? 'AGUARDE')
  if (s === 'FINALIZADO' || s === 'INICIADO' || s === 'PAUSADO') return s
  return 'AGUARDE'
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
    stages: {
      corte:       toStage(r.scorte),
      customizacao:toStage(r.scustom),
      coladeira:   toStage(r.scoladeira),
      usinagem:    toStage(r.susinagem),
      montagem:    toStage(r.smontagem),
      paineis:     toStage(r.spaineis),
      acabamento:  toStage(r.sacabamento),
      embalagem:   toStage(r.sembalagem),
    },
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
