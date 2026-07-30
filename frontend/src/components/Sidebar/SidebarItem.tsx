import type { MenuSubItem } from '../../types/menu'

interface SidebarItemProps {
  item: MenuSubItem
  isActive: boolean
  onClick: (path: string) => void
}

export function SidebarItem({ item, isActive, onClick }: SidebarItemProps) {
  return (
    <li>
      <button
        className={`sidebar-item${isActive ? ' sidebar-item--active' : ''}`}
        onClick={() => onClick(item.path)}
        type="button"
      >
        <span className="sidebar-item__dot" />
        {item.label}
      </button>
    </li>
  )
}
