import { apiGet, apiPost, apiPut } from './api';

export interface Maquina    { id: number; nome: string }
export interface TipoReq    { id: number; descricao: string }
export interface PedidoInfo { pedido: number; cliente: string; ambiente: string }

export interface ParadaAberta {
  id: number; pedido: number; data_inicio: string;
  id_tipo: number; tipo: string;
}

export interface ParadaRow {
  id: number; pedido: number;
  data_inicio: string | null; data_fim: string | null;
  id_maquina: number; maquina: string;
  id_tipo: number; tipo: string;
  id_usuario: number | null;
}

export interface HistoricoRow {
  id: number; campo: string;
  valor_anterior: string | null; valor_novo: string | null;
  alterado_em: string; alterado_por_nome: string | null;
}

export interface EditarParadaPayload {
  pedido?:      number;
  data_inicio?: string | null;
  data_fim?:    string | null;
  id_maquina?:  number;
}

export async function fetchMaquinas(): Promise<Maquina[]> {
  return apiGet('/paradas/maquinas');
}

export async function fetchTipos(): Promise<TipoReq[]> {
  return apiGet('/paradas/tipos');
}

export async function fetchPedidoInfo(tipo: number, pedido: number): Promise<PedidoInfo | null> {
  try {
    return await apiGet('/paradas/buscar-pedido', { tipo, pedido });
  } catch {
    return null;
  }
}

export async function fetchParadaAberta(id_maquina: number): Promise<ParadaAberta | null> {
  const result = await apiGet<ParadaAberta | null>(`/paradas/aberta/${id_maquina}`);
  return result ?? null;
}

export async function fetchAbertas(): Promise<(ParadaRow & ParadaAberta)[]> {
  return apiGet('/paradas/abertas');
}

export async function iniciarParada(payload: {
  pedido: number; id_maquina: number; id_tipo: number;
}): Promise<ParadaRow> {
  return apiPost('/paradas/iniciar', payload);
}

export async function finalizarParada(id_maquina: number): Promise<ParadaAberta> {
  return apiPost('/paradas/finalizar', { id_maquina });
}

// ─── Listagem (operador e admin) ──────────────────────────────────────────────

export async function fetchTodasParadas(filtros?: {
  data_inicio_de?: string; data_inicio_ate?: string; id_maquina?: number;
}): Promise<ParadaRow[]> {
  return apiGet('/paradas/listar', filtros ?? {});
}

// ─── Admin (edição) ───────────────────────────────────────────────────────────

export async function editarParada(id: number, payload: EditarParadaPayload): Promise<ParadaRow> {
  return apiPut(`/paradas/admin/${id}`, payload);
}

export async function fetchHistorico(id: number): Promise<HistoricoRow[]> {
  return apiGet(`/paradas/admin/${id}/historico`);
}
