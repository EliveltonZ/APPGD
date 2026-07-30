import type { LucideIcon } from 'lucide-react'

export interface MenuSubItem {
  id: string
  label: string
  path: string
}

export interface MenuGroup {
  id: string
  label: string
  icon: LucideIcon
  items: MenuSubItem[]
}
