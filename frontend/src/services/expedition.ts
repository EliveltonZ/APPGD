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
    p_ordemdecompra:    d.ordemdecompra,
    p_pronto:           d.pronto    || null,
    p_entrega:          d.entrega   || null,
    p_pendencia:        d.pendencia,
    p_parcial:          d.parcial,
    p_separacao:        d.separacao || null,
    p_conferido:        d.conferido || null,
    p_motorista:        d.motorista || null,
    p_embalageminicio:  d.embalageminicio || null,
    p_embalagemfim:     d.embalagemfim    || null,
    p_embalagempausa:   d.embalagempausa,
    p_embalagemresp:    d.embalagemresp   || null,
    p_avulso:        d.avulso,        p_avulsol:        d.avulsol,        p_avulsoq:        d.avulsoq,
    p_cabide:        d.cabide,        p_cabidel:        d.cabidel,        p_cabideq:        d.cabideq,
    p_paineis:       d.paineis,       p_paineisl:       d.paineisl,       p_paineisq:       d.paineisq,
    p_pecaspintadas: d.pecaspintadas, p_pecaspintadasl: d.pecaspintadasl, p_pecaspintadasq: d.pecaspintadasq,
    p_portaaluminio: d.portaaluminio, p_portaaluminiol: d.portaaluminiol, p_portaaluminioq: d.portaaluminioq,
    p_serralheria:   d.serralheria,   p_serralherial:   d.serralherial,   p_serralheriaq:   d.serralheriaq,
    p_tapecaria:     d.tapecaria,     p_tapecarial:     d.tapecarial,     p_tapecariaq:     d.tapecariaq,
    p_trilho:        d.trilho,        p_trilhol:        d.trilhol,        p_trilhoq:        d.trilhoq,
    p_vidros:        d.vidros,        p_vidrosl:        d.vidrosl,        p_vidrosq:        d.vidrosq,
    p_volmod:        d.volmod,        p_modulosl:       d.modulosl,       p_modulosq:       d.modulosq,
    p_totalvolumes:  d.totalvolumes,
    p_tamanho:       d.tamanho,
    p_observacoes:   d.observacoes,
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
