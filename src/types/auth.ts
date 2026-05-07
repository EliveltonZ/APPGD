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

  for (const route of ROUTE_ITEMS as ReadonlyArray<RouteItem>) {
    const pathMatches =
      path === route.path || path.startsWith(route.path + '/')

    if (!pathMatches) continue

    if (route.isGroupRoot) {
      // Acesso automático ao pai: basta ter qualquer permissão no grupo
      return ROUTE_ITEMS.filter((r) => r.groupId === route.groupId).some(
        (r) => user.permissions[r.permissionKey as PermissionKey],
      )
    }

    return user.permissions[route.permissionKey as PermissionKey] === true
  }

  return false
}
