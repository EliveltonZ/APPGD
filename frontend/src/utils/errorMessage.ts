import { ApiError } from "../services/api";

// Extrai a mensagem amigável de qualquer catch de chamada à API.
// Cobre ApiError (mensagem do backend) e NetworkError (mensagem de conexão
// já embutida na classe) — ambas extends Error, então o fallback só entra
// se o valor capturado nem for um Error de verdade.
export function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

// Erros de DADO por campo (ex.: ValidationError das classes de validação do
// backend, ver backend/src/validation). Retorna undefined para qualquer
// outro tipo de falha (conexão, erro interno do servidor, etc.) — nesses
// casos não há campo específico pra destacar, só a mensagem geral.
export function getFieldErrors(err: unknown): Record<string, string> | undefined {
  return err instanceof ApiError && err.errors && Object.keys(err.errors).length
    ? err.errors
    : undefined;
}
