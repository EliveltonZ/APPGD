import { apiGet, apiPost } from './api'
import { fmtDate, toDateInput, toDatetimeLocal, localDateStr } from '../utils/dateUtils'
import type {
  ExpeditionOrder,
  ExpeditionDetail,
  ExpeditionUser,
  PendingAccessory,
} from '../types/expedition'

type RawRow = Record<string, unknown>

function toExpeditionOrder(raw: RawRow): ExpeditionOrder {
  return {
    ...(raw as unknown as ExpeditionOrder),
    chegoufabrica: fmtDate(raw.chegoufabrica as string) || null,
    dataentrega:   fmtDate(raw.dataentrega   as string) || null,
    iniciado:      fmtDate(raw.iniciado      as string) || null,
    pronto:        fmtDate(raw.pronto        as string) || null,
    entrega:       fmtDate(raw.entrega       as string) || null,
  }
}

function toMaterial(raw: RawRow): PendingAccessory {
  return {
    id:       String(raw.id ?? ''),
    descricao: (raw.descricao as string) ?? '',
    medida:   (raw.medida    as string) ?? '',
    qtd:      (raw.qtd       as number) ?? 0,
    compra:   toDateInput(raw.datacompra),
    previsao: toDateInput(raw.previsao),
    recebido: toDateInput(raw.recebido),
  }
}

function toDetail(raw: RawRow, materiais: RawRow[]): ExpeditionDetail {
  return {
    ordemdecompra:      raw.ordemdecompra as number,
    cliente:            (raw.cliente      as string) ?? '',
    contrato:           raw.contrato      as number,
    codcc:              raw.codcc         as number,
    ambiente:           (raw.ambiente     as string) ?? '',
    numproj:            (raw.numproj      as string) ?? '',
    lote:               raw.lote          as number,
    chegoufabrica:      toDateInput(raw.chegoufabrica),
    dataentrega:        toDateInput(raw.dataentrega),
    etapa:              (raw.etapa        as boolean) ?? false,
    acessoriosPendentes: (raw.total       as number) ?? 0,
    pronto:             toDateInput(raw.pronto),
    entrega:            toDateInput(raw.entrega),
    pendencia:          (raw.pendencia    as boolean) ?? false,
    parcial:            (raw.parcial      as boolean) ?? false,
    separacao:          toDatetimeLocal(raw.separacao),
    conferido:          (raw.conferido    as number) ?? 0,
    conferidoname:      (raw.conferidoname as string) ?? '',
    motorista:          (raw.motorista    as number) ?? 0,
    motoristaname:      (raw.motoristaname as string) ?? '',
    embalageminicio:    toDatetimeLocal(raw.embalageminicio),
    embalagemfim:       toDatetimeLocal(raw.embalagemfim),
    embalagempausa:     (raw.embalagempausa as boolean) ?? false,
    embalagemresp:      (raw.embalagemresp  as number) ?? 0,
    embalagemname:      (raw.embalagemname  as string) ?? '',
    tamanho:            (raw.tamanho     as string) ?? '',
    observacoes:        (raw.observacoes as string) ?? '',
    totalvolumes:       (raw.totalvolumes as number) ?? 0,
    avulso:        (raw.avulso        as boolean) ?? false,
    avulsol:       (raw.avulsol       as string)  ?? '',
    avulsoq:       (raw.avulsoq       as number)  ?? 0,
    cabide:        (raw.cabide        as boolean) ?? false,
    cabidel:       (raw.cabidel       as string)  ?? '',
    cabideq:       (raw.cabideq       as number)  ?? 0,
    paineis:       (raw.paineis       as boolean) ?? false,
    paineisl:      (raw.paineisl      as string)  ?? '',
    paineisq:      (raw.paineisq      as number)  ?? 0,
    pecaspintadas: (raw.pecaspintadas as boolean) ?? false,
    pecaspintadasl:(raw.pecaspintadasl as string) ?? '',
    pecaspintadasq:(raw.pecaspintadasq as number) ?? 0,
    portaaluminio: (raw.portaaluminio as boolean) ?? false,
    portaaluminiol:(raw.portaaluminiol as string) ?? '',
    portaaluminioq:(raw.portaaluminioq as number) ?? 0,
    serralheria:   (raw.serralheria   as boolean) ?? false,
    serralherial:  (raw.serralherial  as string)  ?? '',
    serralheriaq:  (raw.serralheriaq  as number)  ?? 0,
    tapecaria:     (raw.tapecaria     as boolean) ?? false,
    tapecarial:    (raw.tapecarial    as string)  ?? '',
    tapecariaq:    (raw.tapecariaq    as number)  ?? 0,
    trilho:        (raw.trilho        as boolean) ?? false,
    trilhol:       (raw.trilhol       as string)  ?? '',
    trilhoq:       (raw.trilhoq       as number)  ?? 0,
    vidros:        (raw.vidros        as boolean) ?? false,
    vidrosl:       (raw.vidrosl       as string)  ?? '',
    vidrosq:       (raw.vidrosq       as number)  ?? 0,
    volmod:        (raw.volmod        as boolean) ?? false,
    modulosl:      (raw.modulosl      as string)  ?? '',
    modulosq:      (raw.modulosq      as number)  ?? 0,
    acessoriosCompra: materiais.map(toMaterial),
  }
}

function toSavePayload(d: ExpeditionDetail) {
  return {
    ordemdecompra:    d.ordemdecompra,
    pronto:           d.pronto    || null,
    entrega:          d.entrega   || null,
    pendencia:        d.pendencia,
    parcial:          d.parcial,
    separacao:        d.separacao || null,
    conferido:        d.conferido || null,
    motorista:        d.motorista || null,
    embalageminicio:  d.embalageminicio || null,
    embalagemfim:     d.embalagemfim    || null,
    embalagempausa:   d.embalagempausa,
    embalagemresp:    d.embalagemresp   || null,
    avulso:        d.avulso,        avulsol:        d.avulsol,        avulsoq:        d.avulsoq,
    cabide:        d.cabide,        cabidel:        d.cabidel,        cabideq:        d.cabideq,
    paineis:       d.paineis,       paineisl:       d.paineisl,       paineisq:       d.paineisq,
    pecaspintadas: d.pecaspintadas, pecaspintadasl: d.pecaspintadasl, pecaspintadasq: d.pecaspintadasq,
    portaaluminio: d.portaaluminio, portaaluminiol: d.portaaluminiol, portaaluminioq: d.portaaluminioq,
    serralheria:   d.serralheria,   serralherial:   d.serralherial,   serralheriaq:   d.serralheriaq,
    tapecaria:     d.tapecaria,     tapecarial:     d.tapecarial,     tapecariaq:     d.tapecariaq,
    trilho:        d.trilho,        trilhol:        d.trilhol,        trilhoq:        d.trilhoq,
    vidros:        d.vidros,        vidrosl:        d.vidrosl,        vidrosq:        d.vidrosq,
    volmod:        d.volmod,        modulosl:       d.modulosl,       modulosq:       d.modulosq,
    totalvolumes:  d.totalvolumes,
    tamanho:       d.tamanho,
    observacoes:   d.observacoes,
  }
}

function oneYearAgo(): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 1)
  return localDateStr(d)
}

export async function fetchExpeditionOrders(
  dataCondition = oneYearAgo(),
): Promise<ExpeditionOrder[]> {
  const rows = await apiGet<RawRow[]>('/expedicao/', { data_condition: dataCondition })
  return rows.map(toExpeditionOrder)
}

export async function fetchExpeditionDetail(
  orderId: number,
): Promise<ExpeditionDetail | null> {
  const [detailRows, materiaisRows] = await Promise.all([
    apiGet<RawRow[]>('/expedicao/projeto',   { id: orderId }),
    apiGet<RawRow[]>('/expedicao/materiais', { id: orderId }),
  ])
  const raw = Array.isArray(detailRows) ? detailRows[0] : null
  if (!raw) return null
  return toDetail(raw, Array.isArray(materiaisRows) ? materiaisRows : [])
}

export async function saveExpeditionData(detail: ExpeditionDetail): Promise<void> {
  await apiPost('/expedicao/dados', toSavePayload(detail))
}

export async function fetchExpeditionUsers(): Promise<ExpeditionUser[]> {
  const rows = await apiGet<RawRow[]>('/utils/operadores')
  return rows.map((r) => ({ id: String(r.id ?? ''), nome: (r.nome as string) ?? '' }))
}
