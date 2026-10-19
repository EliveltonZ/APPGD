import { ApiError } from "../services/api";

// Extrai a mensagem amigável de qualquer catch de chamada à API.
// Cobre ApiError (mensagem do backend) e NetworkError (mensagem de conexão
// já embutida na classe) — ambas extends Error, então o fallback só entra
// se o valor capturado nem for um Error de verdade.
//
// ValidationError (backend/src/validation) sempre chega com a mensagem
// genérica "Dados inválidos" em err.message — o detalhe real mora em
// err.errors (por campo). Telas que ainda não têm UI de erro por campo
// (listas/carrinhos de itens, por exemplo) dependem só deste helper pro
// toast — por isso aqui ele prioriza a primeira mensagem específica de
// err.errors antes de cair no err.message genérico. Telas que JÁ chamam
// getFieldErrors() pra popular setErrors() não são afetadas: nesse fluxo
// getErrorMessage() só é chamado no ramo "else" (sem errors), então o
// comportamento de quem já usa esse padrão continua igual.
export function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError && err.errors) {
    const primeiro = Object.values(err.errors)[0];
    if (primeiro) return primeiro;
  }
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
