// ── Camada base de comunicação HTTP com o backend ────────────────────────────
// Todas as requisições da aplicação passam por aqui.
// Responsabilidades:
//   - Adicionar o JWT automaticamente em todo request
//   - Redirecionar para /login se o token expirar (HTTP 401)
//   - Lançar Error com a mensagem do servidor em caso de falha

// Em produção, VITE_API_URL é vazio e o frontend usa o mesmo host (Express serve os dois)
const BASE            = import.meta.env.VITE_API_URL ?? ''
const TOKEN_STORAGE   = 'gd_auth_token'
const USER_STORAGE    = 'gd_auth_user'

function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE)
}

// Função interna — não exportada. Use apiGet/apiPost/apiPut.
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken()

  const res = await fetch(`${BASE}/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      // Injeta o token JWT no header se o usuário estiver autenticado
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    ...init,
  })

  // 401 significa token ausente ou expirado — limpa o storage e redireciona para login
  if (res.status === 401) {
    localStorage.removeItem(USER_STORAGE)
    localStorage.removeItem(TOKEN_STORAGE)
    window.location.href = '/login'
    throw new Error('Sessão expirada')
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, unknown>
    throw new Error((body.message as string) ?? (body.error as string) ?? `HTTP ${res.status}`)
  }

  return res.json() as Promise<T>
}

// GET com query string. Ex.: apiGet('/assistencias', { p_solicitacao: '123' })
export function apiGet<T>(
  path: string,
  params?: Record<string, string | number | boolean>,
): Promise<T> {
  const qs = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''
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
