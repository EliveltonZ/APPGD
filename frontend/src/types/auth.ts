import { ROUTE_ITEMS } from '../config/appRoutes'
import type { PermissionKey, RouteItem } from '../config/appRoutes'

export type { PermissionKey }

/** Mapa de permissões: cada chave corresponde a uma rota cadastrada no sistema */
export type UserPermissions = Record<PermissionKey, boolean>

export interface AuthUser {
  id: string
  nome: string
  role: string
  permissions: UserPermissions
}

/** Retorna um UserPermissions com todas as permissões em false */
export function emptyPermissions(): UserPermissions {
  return Object.fromEntries(
    ROUTE_ITEMS.map((r) => [r.permissionKey, false]),
  ) as UserPermissions
}

/**
 * Verifica se o usuário autenticado tem acesso a um caminho de rota.
 *
 * Regras:
 * - `/` e `/dashboard` são sempre acessíveis para usuários autenticados.
 * - Rotas marcadas como `isGroupRoot: true` são acessíveis automaticamente
 *   se o usuário tiver qualquer permissão dentro do mesmo grupo (acesso ao pai).
 * - Demais rotas exigem a permissão exata correspondente.
 */
export function hasPermission(user: AuthUser, path: string): boolean {
  if (path === '/' || path === '/dashboard') return true

  // Coleta TODAS as rotas que correspondem ao caminho — múltiplas permissões
  // podem conceder acesso à mesma rota (lógica OR).
  for (const route of ROUTE_ITEMS as ReadonlyArray<RouteItem>) {
    const pathMatches =
      path === route.path || path.startsWith(route.path + '/')

    if (!pathMatches) continue

    if (route.isGroupRoot) {
      if (ROUTE_ITEMS.filter((r) => r.groupId === route.groupId).some(
        (r) => user.permissions[r.permissionKey as PermissionKey],
      )) return true
      continue
    }

    if (user.permissions[route.permissionKey as PermissionKey] === true) return true
  }

  return false
}
