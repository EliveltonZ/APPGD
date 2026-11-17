import { kioskGet, kioskPost } from '../../services/kioskApi';
import { mapRow, buildApontamentoPayload } from './service';
import type { ApontamentoProject, Operator } from './types';

type ApiRow = Record<string, unknown>;

// Versão pública de fetchApontamentoOperators (service.ts) — aquela usa o
// cliente autenticado (apiGet), que faz 401 -> redireciona pra /login.
// Nesse terminal não existe login nenhum, então precisa da própria rota
// pública pra não quebrar a tela assim que carrega.
export async function fetchApontamentoOperatorsPublico(): Promise<Operator[]> {
  const rows = await kioskGet<{ id: unknown; nome: unknown }[]>('/operadores');
  return rows.map((r) => ({ id: String(r.id ?? ''), nome: String(r.nome ?? '') }));
}

export async function fetchProjectByPedidoPublico(pedido: string): Promise<ApontamentoProject[] | null> {
  const rows = await kioskGet<ApiRow[]>('/pedido', { pedido });
  if (!rows.length) return null;
  const num = parseInt(pedido, 10);
  return rows.map((r) => mapRow(r, num));
}

export async function saveApontamentoPublico(project: ApontamentoProject): Promise<void> {
  await kioskPost('/dados', buildApontamentoPayload(project));
}

export interface OperadorCracha {
  id: number;
  nome: string;
}

// Lança KioskAuthError se o PIN tiver sido invalidado nesse meio-tempo —
// quem chama deve tratar isso voltando pra tela de PIN. 404 (crachá não
// reconhecido) é o único caso tratado aqui, virando null.
export async function buscarOperadorPorCracha(hash: string): Promise<OperadorCracha | null> {
  try {
    return await kioskGet<OperadorCracha>('/operador', { hash });
  } catch (err) {
    if (err instanceof Error && err.message === 'Crachá não reconhecido') return null;
    throw err;
  }
}
