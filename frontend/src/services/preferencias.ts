import { apiGet, apiPost } from './api';

/**
 * Busca preferências salvas no banco para o usuário autenticado.
 * @param chaves Lista de chaves desejadas.
 * @returns Objeto { chave: valor } para as chaves encontradas.
 */
export async function getPreferencias(chaves: string[]): Promise<Record<string, string>> {
  if (!chaves.length) return {};
  return apiGet<Record<string, string>>('/preferencias', { chaves: chaves.join(',') });
}

/**
 * Persiste preferências no banco para o usuário autenticado.
 * @param prefs Objeto { chave: valor } a salvar (upsert).
 */
export async function setPreferencias(prefs: Record<string, string>): Promise<void> {
  if (!Object.keys(prefs).length) return;
  await apiPost('/preferencias', prefs);
}
