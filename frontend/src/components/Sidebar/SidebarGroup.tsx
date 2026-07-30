import { ChevronRight } from "lucide-react";
import type { MenuGroup } from "../../types/menu";
import { SidebarItem } from "./SidebarItem";

interface SidebarGroupProps {
  group: MenuGroup;
  isExpanded: boolean;
  onToggle: () => void;
  activeItem: string;
  onItemClick: (path: string) => void;
  isCollapsed?: boolean;
}

export function SidebarGroup({
  group,
  isExpanded,
  onToggle,
  activeItem,
  onItemClick,
  isCollapsed = false,
}: SidebarGroupProps) {
  const Icon = group.icon;
  const hasActive = group.items.some((item) => item.path === activeItem);

  const classes = [
    "sidebar-group",
    isExpanded ? "sidebar-group--expanded" : "",
    hasActive ? "sidebar-group--has-active" : "",
  ]
    .filter(Boolean)
    .join(" ");

  function handleTriggerClick() {
    if (isCollapsed) {
      const target =
        group.items.find((i) => i.path === activeItem) ?? group.items[0];
      if (target) onItemClick(target.path);
    } else {
      onToggle();
    }
  }

  return (
    <div className={classes}>
      <button
        className="sidebar-group__trigger"
        onClick={handleTriggerClick}
        type="button"
        aria-expanded={isCollapsed ? undefined : isExpanded}
        title={isCollapsed ? group.label : undefined}
      >
        <span className="sidebar-group__icon">
          <Icon size={15} />
        </span>
        <span className="sidebar-group__label">{group.label}</span>
        <ChevronRight size={13} className="sidebar-group__chevron" />
      </button>

      <div className="sidebar-group__list-wrapper">
        <ul className="sidebar-group__list">
          {group.items.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              isActive={activeItem === item.path}
              onClick={onItemClick}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
