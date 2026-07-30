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

function toInsertPayload(form: ProjectFormData) {
  return {
    p_contrato:        Number(form.contrato),
    p_ordemdecompra:   Number(form.numOC),
    p_id_cliente:      Number(form.clienteId),
    p_id_tipoambiente: form.tipoAmbiente,
    p_ambiente:        form.ambiente,
    p_numproj:         form.numeroProjeto,
    p_id_vendedor:     Number(form.vendedor),
    p_id_liberador:    Number(form.liberador),
    p_datacontrato:    form.dataContrato    || null,
    p_dataassinatura:  form.dataAssinatura  || null,
    p_chegoufabrica:   form.chegouFabrica   || null,
    p_dataentrega:     form.dataEntrega     || null,
    p_id_loja:         Number(form.loja),
    p_id_tipocliente:  Number(form.clienteTipo),
    p_id_etapa:        Number(form.etapa),
    p_id_tipocontrato: Number(form.tipoContrato),
    p_valorbruto:      parseCurrencyToNumber(form.valorBruto),
    p_valornegociado:  parseCurrencyToNumber(form.valorNegociado),
    p_customaterial:   parseCurrencyToNumber(form.custoMaterial),
    p_custoadicional:  parseCurrencyToNumber(form.custoAdicional),
  }
}

export async function saveProject(form: ProjectFormData): Promise<void> {
  await apiPost('/projetos', toInsertPayload(form))
}

export async function saveClient(nome: string): Promise<void> {
  await apiPost('/projetos/cliente', { p_nome_cliente: nome })
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
  return {
    p_ordemdecompra:        Number(form.numOC),
    p_contrato:             Number(form.contrato),
    p_id_cliente:           Number(form.clienteId),
    p_id_tipoambiente:      Number(form.tipoAmbiente),
    p_ambiente:             form.ambiente,
    p_numproj:              form.numeroProjeto,
    p_id_vendedor:          Number(form.vendedor),
    p_id_liberador:         Number(form.liberador),
    p_datacontrato:         form.dataContrato    || null,
    p_dataassinatura:       form.dataAssinatura  || null,
    p_chegoufabrica:        form.chegouFabrica   || null,
    p_dataentrega:          form.dataEntrega     || null,
    p_id_loja:              Number(form.loja),
    p_id_tipocliente:       Number(form.clienteTipo),
    p_id_etapa:             Number(form.etapa),
    p_id_tipocontrato:      Number(form.tipoContrato),
    p_valorbruto:           parseCurrencyToNumber(form.valorBruto),
    p_valornegociado:       parseCurrencyToNumber(form.valorNegociado),
    p_customaterial:        parseCurrencyToNumber(form.custoMaterial),
    p_customaterialadicional: parseCurrencyToNumber(form.custoAdicional),
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
  const rows = await apiGet<RawRow[]>('/projetos/deletar', { p_ordemdecompra: ordemdecompra })
  const raw = Array.isArray(rows) ? rows[0] : null
  if (!raw) return null
  return toDeleteData(raw)
}

export async function deleteProject(numOC: string): Promise<void> {
  await apiPost('/projetos/deletar', { p_ordemdecompra: Number(numOC) })
}
