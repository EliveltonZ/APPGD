// ── Camada base de comunicação HTTP com o backend ────────────────────────────
// Todas as requisições da aplicação passam por aqui.
// Responsabilidades:
//   - Adicionar o JWT automaticamente em todo request
//   - Redirecionar para /login se o token expirar (HTTP 401)
//   - Lançar Error com a mensagem do servidor em caso de falha

import { STORAGE_KEYS } from '../utils/storageKeys'
import type { ValidationErrors } from '../validation/types'

// Em produção, VITE_API_URL é vazio e o frontend usa o mesmo host (Express serve os dois)
const BASE = import.meta.env.VITE_API_URL ?? ''

// Lançado quando o backend RESPONDE com erro (qualquer status >= 400).
// `status` permite diferenciar a causa: 400 = dado inválido, 403 = permissão,
// 404 = não encontrado, 409 = conflito, >=500 = erro interno do servidor.
// `errors` só vem preenchido em erro de dados (ex.: ValidationError de
// backend/src/validation) — mesmo shape do ValidationResult do frontend,
// pra dar pra jogar direto em setErrors() sem tradução.
export class ApiError extends Error {
  status: number
  errors?: ValidationErrors

  constructor(message: string, status: number, errors?: ValidationErrors) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

// Lançado quando a requisição NÃO chega a ter resposta do backend
// (servidor fora do ar, sem internet, bloqueio de CORS/DNS). Diferente de
// ApiError: aqui não há status HTTP nenhum, porque não houve resposta.
export class NetworkError extends Error {
  constructor() {
    super('Não foi possível conectar ao servidor. Verifique sua conexão.')
    this.name = 'NetworkError'
  }
}

function getToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.authToken)
}

// Função interna — não exportada. Use apiGet/apiPost/apiPut.
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken()

  let res: Response
  try {
    res = await fetch(`${BASE}/api${path}`, {
      headers: {
        'Content-Type': 'application/json',
        // Injeta o token JWT no header se o usuário estiver autenticado
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      ...init,
    })
  } catch {
    // fetch() só lança quando a requisição não chega a ter resposta
    // (sem rede, servidor fora do ar, CORS) — nunca por causa de status HTTP.
    throw new NetworkError()
  }

  // 401 significa token ausente ou expirado — limpa o storage e redireciona para login
  if (res.status === 401) {
    localStorage.removeItem(STORAGE_KEYS.authToken)
    window.location.href = '/login'
    throw new ApiError('Sessão expirada', 401)
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, unknown>
    const message = (body.message as string) ?? (body.error as string) ?? `HTTP ${res.status}`
    const errors = body.errors as ValidationErrors | undefined
    throw new ApiError(message, res.status, errors && Object.keys(errors).length ? errors : undefined)
  }

  return res.json() as Promise<T>
}

// GET com query string. Ex.: apiGet('/assistencias', { p_solicitacao: '123' })
export function apiGet<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>,
): Promise<T> {
  const clean = params
    ? Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null),
      ) as Record<string, string>
    : null
  const qs = clean && Object.keys(clean).length ? `?${new URLSearchParams(clean)}` : ''
  return request<T>(`${path}${qs}`)
}

// POST com body JSON
export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) })
}

// PUT com body JSON
export function apiPut<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PUT', body: JSON.stringify(body) })
}

// DELETE
export function apiDelete(path: string): Promise<void> {
  return request<void>(path, { method: 'DELETE' })
}
