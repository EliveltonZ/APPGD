// ── Camada HTTP do terminal público de apontamento ───────────────────────────
// Separada de services/api.ts de propósito: aqui não existe sessão nem
// token JWT — só o PIN do terminal (configurado uma vez por aparelho),
// enviado em todo request. Um PIN inválido não redireciona pra /login (não
// existe login nesse fluxo); quem usa trata KioskAuthError pra pedir o PIN
// de novo.

const BASE = import.meta.env.VITE_API_URL ?? ''
const PIN_STORAGE_KEY = 'kiosk_pin'

export class KioskAuthError extends Error {
  constructor() {
    super('PIN do terminal inválido ou não configurado.')
    this.name = 'KioskAuthError'
  }
}

export function getKioskPin(): string | null {
  return localStorage.getItem(PIN_STORAGE_KEY)
}

export function setKioskPin(pin: string): void {
  localStorage.setItem(PIN_STORAGE_KEY, pin)
}

export function clearKioskPin(): void {
  localStorage.removeItem(PIN_STORAGE_KEY)
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const pin = getKioskPin()

  let res: Response
  try {
    res = await fetch(`${BASE}/api/apontamento-publico${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(pin ? { 'X-Kiosk-Pin': pin } : {}),
      },
      ...init,
    })
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão.')
  }

  if (res.status === 401) {
    clearKioskPin()
    throw new KioskAuthError()
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, unknown>
    const message = (body.message as string) ?? (body.error as string) ?? `HTTP ${res.status}`
    throw new Error(message)
  }

  return res.json() as Promise<T>
}

export function kioskGet<T>(
  path: string,
  params?: Record<string, string | number | undefined | null>,
): Promise<T> {
  const clean = params
    ? Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null),
      ) as Record<string, string>
    : null
  const qs = clean && Object.keys(clean).length ? `?${new URLSearchParams(clean)}` : ''
  return request<T>(`${path}${qs}`)
}

export function kioskPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) })
}

// Testa um PIN contra o backend sem salvar nada — usado só na tela de
// configuração inicial do terminal, pra validar antes de gravar.
export async function testarKioskPin(pin: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/api/apontamento-publico/ping`, {
      headers: { 'X-Kiosk-Pin': pin },
    })
    return res.ok
  } catch {
    return false
  }
}
