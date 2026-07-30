// ── Contexto global de autenticação ──────────────────────────────────────────
// Responsável por:
//   1. Carregar o usuário logado a partir do JWT salvo no localStorage (persistência entre refreshes)
//   2. Expor login() / logout() para os componentes filhos
//   3. Guardar o AuthUser com todas as permissões decodificadas do token
//
// Fluxo de login:
//   LoginPage → POST /api/auth/login → recebe JWT → chama login(user, token)
//   → AuthContext salva token no localStorage + estado em memória
//
// Fluxo de logout / expiração:
//   logout() ou HTTP 401 em api.ts → remove localStorage → estado vira null → redirect /login

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { AuthUser } from "../types/auth";
import { toAuthUser } from "../services/usuarios";

interface AuthContextValue {
  user: AuthUser | null;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY_TOKEN = "gd_auth_token";

// Decodifica a parte do payload do JWT (segunda parte, separada por ".")
// sem verificar a assinatura — apenas para ler os dados do usuário no cliente.
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

// Chamada uma vez na inicialização do AuthProvider.
// Se houver token válido e não expirado no localStorage, restaura o usuário automaticamente.
function loadUserFromToken(): AuthUser | null {
  const token = localStorage.getItem(STORAGE_KEY_TOKEN);
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  if (!payload) {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    return null;
  }

  // Verifica expiração pelo campo `exp` do JWT (Unix timestamp em segundos)
  if (typeof payload.exp === "number" && Date.now() / 1000 > payload.exp) {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    return null;
  }

  // Permissões sempre derivadas do token — nunca lidas de outro lugar no localStorage
  try {
    const permissoes = payload.permissoes as Record<string, unknown>;
    // JWT com formato inválido (pré-migração com p_ prefix, ou pós-migração com camelCase): força re-login
    if ('p_novo_pedido' in permissoes || 'p_id' in permissoes || 'novoPedido' in permissoes) {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      return null;
    }
    return toAuthUser({
      ...permissoes,
      id:    payload.sub,
      login: payload.nome,
    });
  } catch {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Estado inicial: tenta restaurar usuário do token salvo (hydration no reload da página)
  const [user, setUser] = useState<AuthUser | null>(loadUserFromToken);

  function login(u: AuthUser, token: string) {
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
    setUser(u);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook de conveniência — use dentro de qualquer componente filho do AuthProvider
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
