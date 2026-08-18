import { apiGet, apiPost } from './api'
import { toDateInput } from '../utils/dateUtils'
import { formatCurrencyFromDB, parseCurrencyToNumber } from '../utils/currencyUtils'
import type { ProjectFormData } from '../types/project'

type RawRow = Record<string, unknown>

function toContractData(raw: RawRow): Partial<ProjectFormData> {
  return {
    clienteId:      String(raw.id_cliente     ?? ''),
    clienteNome:    (raw.cliente              as string) ?? '',
    clienteTipo:    String(raw.id_tipocliente ?? ''),
    vendedor:       (raw.id_vendedor          as number) ?? 0,
    liberador:      (raw.id_liberador         as number) ?? 0,
    loja:           raw.id_loja != null ? Number(raw.id_loja) : 0,
    dataContrato:   toDateInput(raw.datacontrato),
    dataAssinatura: toDateInput(raw.dataassinatura),
    chegouFabrica:  toDateInput(raw.chegoufabrica),
    dataEntrega:    toDateInput(raw.dataentrega),
    etapa:          String(raw.id_etapa       ?? ''),
  }
}

function assistenciaFields(form: ProjectFormData) {
  return {
    oc_origem:          form.ocOrigem ? Number(form.ocOrigem) : null,
    motivo_assistencia: form.motivoAssistencia || null,
    supervisor:         form.supervisor || null,
    tipo_solicitacao:   form.tipoSolicitacaoAssist ? Number(form.tipoSolicitacaoAssist) : null,
    origem_montagem:    form.origemMontagem || null,
    origem_promob:      form.origemPromob   || null,
    origem_cobrada:     form.origemCobrada  || null,
    observacoes:        form.observacoesAssist || null,
    solicitante:        form.solicitante || null,
    id_solicitante:     form.idSolicitante ?? null,
    urgente:            form.urgente,
  }
}

function toInsertPayload(form: ProjectFormData) {
  const isAssistencia = form.tipoProjeto === 'ASSISTENCIA'
  return {
    tipo_projeto:    form.tipoProjeto || 'PROJETO',
    ordemdecompra:   Number(form.numOC),
    // campos compartilhados
    cliente_nome:    form.clienteNome || null,
    ambiente:        form.ambiente    || null,
    dataentrega:     form.dataEntrega || null,
    // campos apenas de projeto (null para assistência)
    contrato:        isAssistencia ? null : Number(form.contrato),
    id_cliente:      isAssistencia ? null : Number(form.clienteId),
    id_tipoambiente: isAssistencia ? null : form.tipoAmbiente,
    numproj:         isAssistencia ? null : form.numeroProjeto,
    id_vendedor:     isAssistencia ? null : Number(form.vendedor),
    id_liberador:    isAssistencia ? null : Number(form.liberador),
    datacontrato:    isAssistencia ? null : (form.dataContrato   || null),
    dataassinatura:  isAssistencia ? null : (form.dataAssinatura || null),
    chegoufabrica:   isAssistencia ? null : (form.chegouFabrica  || null),
    id_loja:         isAssistencia ? null : Number(form.loja),
    id_tipocliente:  isAssistencia ? null : Number(form.clienteTipo),
    id_etapa:        isAssistencia ? null : Number(form.etapa),
    id_tipocontrato: isAssistencia ? null : Number(form.tipoContrato),
    valorbruto:      isAssistencia ? 0    : parseCurrencyToNumber(form.valorBruto),
    valornegociado:  isAssistencia ? 0    : parseCurrencyToNumber(form.valorNegociado),
    customaterial:   isAssistencia ? 0    : parseCurrencyToNumber(form.custoMaterial),
    custoadicional:  isAssistencia ? 0    : parseCurrencyToNumber(form.custoAdicional),
    ...assistenciaFields(form),
  }
}

export async function saveProject(form: ProjectFormData): Promise<void> {
  await apiPost('/projetos', toInsertPayload(form))
}

export async function saveClient(nome: string): Promise<void> {
  await apiPost('/projetos/cliente', { nome_cliente: nome })
}

export async function fetchClients(): Promise<{ id: string; nome: string; tipo: string }[]> {
  const rows = await apiGet<RawRow[]>('/projetos/clientes')
  return rows.map((r) => ({
    id:   String(r.id   ?? ''),
    nome: (r.nome as string) ?? '',
    tipo: '',
  }))
}

export async function fetchContractData(
  contrato: string,
): Promise<Partial<ProjectFormData> | null> {
  const rows = await apiGet<RawRow[]>('/projetos/contrato', { contrato })
  const raw = Array.isArray(rows) ? rows[0] : null
  if (!raw) return null
  return toContractData(raw)
}

export type ContractOption = Partial<ProjectFormData> & {
  clienteNome: string;
}

export async function fetchContractOptions(
  contrato: string,
): Promise<ContractOption[]> {
  const rows = await apiGet<RawRow[]>('/projetos/contrato', { contrato })
  if (!Array.isArray(rows) || !rows.length) return []
  return rows.map((r) => ({
    ...toContractData(r),
    clienteNome: (r.cliente as string) ?? '',
  }))
}

function toEditData(raw: RawRow): Partial<ProjectFormData> {
  return {
    contrato:       String(raw.contrato      ?? ''),
    clienteId:      String(raw.id_cliente    ?? ''),
    clienteNome:    (raw.cliente             as string) ?? '',
    clienteTipo:    String(raw.id_tipocliente ?? ''),
    tipoAmbiente:   raw.id_tipoambiente      as number,
    ambiente:       (raw.ambiente            as string) ?? '',
    numeroProjeto:  (raw.numproj             as string) ?? '',
    vendedor:       raw.id_vendedor          as number,
    liberador:      raw.id_liberador         as number,
    loja:           raw.id_loja              as number,
    etapa:          raw.id_etapa             as number,
    tipoContrato:   raw.id_tipocontrato      as number,
    dataContrato:   toDateInput(raw.datacontrato),
    dataAssinatura: toDateInput(raw.dataassinatura),
    chegouFabrica:  toDateInput(raw.chegoufabrica),
    dataEntrega:    toDateInput(raw.dataentrega),
    valorBruto:     formatCurrencyFromDB(raw.valorbruto             as number),
    valorNegociado: formatCurrencyFromDB(raw.valornegociado        as number),
    custoMaterial:  formatCurrencyFromDB(raw.customaterial         as number),
    custoAdicional: formatCurrencyFromDB(raw.customaterialadicional as number),
    tipoProjeto:           (raw.tipo_projeto as string)       ?? 'PROJETO',
    ocOrigem:              raw.oc_origem ? String(raw.oc_origem) : '',
    motivoAssistencia:     (raw.motivo_assistencia as string) ?? '',
    urgente:               Boolean(raw.urgente),
    supervisor:            (raw.supervisor  as string)        ?? '',
    tipoSolicitacaoAssist: raw.tipo_solicitacao != null ? Number(raw.tipo_solicitacao) : '',
    origemMontagem:        Boolean(raw.origem_montagem),
    origemPromob:          Boolean(raw.origem_promob),
    origemCobrada:         Boolean(raw.origem_cobrada),
    observacoesAssist:     (raw.observacoes  as string)       ?? '',
    solicitante:           (raw.solicitante     as string)  ?? '',
    idSolicitante:         raw.id_solicitante != null ? Number(raw.id_solicitante) : null,
  }
}

export async function fetchEditProject(
  ordemdecompra: string,
): Promise<Partial<ProjectFormData> | null> {
  const rows = await apiGet<RawRow[]>('/projetos/editar', { id: ordemdecompra })
  const raw = Array.isArray(rows) ? rows[0] : null
  if (!raw) return null
  return toEditData(raw)
}

function toUpdatePayload(form: ProjectFormData) {
  const isAssistencia = form.tipoProjeto === 'ASSISTENCIA'
  return {
    tipo_projeto:    form.tipoProjeto || 'PROJETO',
    ordemdecompra:   Number(form.numOC),
    // campos compartilhados
    cliente_nome:    form.clienteNome || null,
    ambiente:        form.ambiente    || null,
    dataentrega:     form.dataEntrega || null,
    // campos apenas de projeto (null para assistência)
    contrato:              isAssistencia ? null : Number(form.contrato),
    id_cliente:            isAssistencia ? null : Number(form.clienteId),
    id_tipoambiente:       isAssistencia ? null : Number(form.tipoAmbiente),
    numproj:               isAssistencia ? null : form.numeroProjeto,
    id_vendedor:           isAssistencia ? null : Number(form.vendedor),
    id_liberador:          isAssistencia ? null : Number(form.liberador),
    datacontrato:          isAssistencia ? null : (form.dataContrato   || null),
    dataassinatura:        isAssistencia ? null : (form.dataAssinatura || null),
    chegoufabrica:         isAssistencia ? null : (form.chegouFabrica  || null),
    id_loja:               isAssistencia ? null : Number(form.loja),
    id_tipocliente:        isAssistencia ? null : Number(form.clienteTipo),
    id_etapa:              isAssistencia ? null : Number(form.etapa),
    id_tipocontrato:       isAssistencia ? null : Number(form.tipoContrato),
    valorbruto:            isAssistencia ? 0    : parseCurrencyToNumber(form.valorBruto),
    valornegociado:        isAssistencia ? 0    : parseCurrencyToNumber(form.valorNegociado),
    customaterial:         isAssistencia ? 0    : parseCurrencyToNumber(form.custoMaterial),
    customaterialadicional: isAssistencia ? 0   : parseCurrencyToNumber(form.custoAdicional),
    ...assistenciaFields(form),
  }
}

export async function saveEditProject(form: ProjectFormData): Promise<void> {
  await apiPost('/projetos/editar', toUpdatePayload(form))
}

function toDeleteData(raw: RawRow): Partial<ProjectFormData> {
  return {
    contrato:       String(raw.contrato      ?? ''),
    clienteNome:    String(raw.cliente       ?? ''),
    clienteTipo:    String(raw.tipocliente   ?? ''),
    tipoAmbiente:   String(raw.tipoambiente  ?? ''),
    ambiente:       String(raw.ambiente      ?? ''),
    numeroProjeto:  String(raw.numproj       ?? ''),
    vendedor:       String(raw.vendedor      ?? ''),
    liberador:      String(raw.liberador     ?? ''),
    loja:           String(raw.loja          ?? ''),
    etapa:          String(raw.etapa         ?? ''),
    tipoContrato:   String(raw.tipocontrato  ?? ''),
    dataContrato:   toDateInput(raw.datacontrato),
    dataAssinatura: toDateInput(raw.dataassinatura),
    chegouFabrica:  toDateInput(raw.chegoufabrica),
    dataEntrega:    toDateInput(raw.dataentrega),
    valorBruto:     formatCurrencyFromDB(raw.valorbruto             as number),
    valorNegociado: formatCurrencyFromDB(raw.valornegociado         as number),
    custoMaterial:  formatCurrencyFromDB(raw.customaterial          as number),
    custoAdicional: formatCurrencyFromDB(raw.customaterialadicional as number),
  }
}

export async function fetchDeleteProject(
  ordemdecompra: string,
): Promise<Partial<ProjectFormData> | null> {
  const rows = await apiGet<RawRow[]>('/projetos/deletar', { ordemdecompra })
  const raw = Array.isArray(rows) ? rows[0] : null
  if (!raw) return null
  return toDeleteData(raw)
}

export async function deleteProject(numOC: string): Promise<void> {
  await apiPost('/projetos/deletar', { ordemdecompra: Number(numOC) })
}

export async function fetchProximoOcAssistencia(): Promise<number> {
  const result = await apiGet<{ oc: number }>('/projetos/assistencia/proximo-oc')
  return result.oc
}
