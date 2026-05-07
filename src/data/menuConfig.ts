/**
 * Menu lateral derivado automaticamente de src/config/appRoutes.ts.
 * Não edite manualmente — adicione ou altere rotas em appRoutes.ts.
 */

import { ROUTE_GROUPS, ROUTE_ITEMS } from '../config/appRoutes'
import type { MenuGroup } from '../types/menu'

export const menuGroups: MenuGroup[] = ROUTE_GROUPS.map((group) => ({
  id: group.id,
  label: group.label,
  icon: group.icon,
  items: ROUTE_ITEMS.filter((route) => route.groupId === group.id).map(
    (route) => ({
      id: route.permissionKey,
      label: route.menuLabel,
      path: route.path,
    }),
  ),
})).filter((group) => group.items.length > 0)
