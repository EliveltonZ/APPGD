import { useState } from "react";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import logo from "../../assets/logo.png";
import type { MenuGroup } from "../../types/menu";
import { SidebarGroup } from "./SidebarGroup";
import "./index.css";

interface SidebarProps {
  groups: MenuGroup[];
  activeItem: string;
  onItemClick: (path: string) => void;
  onLogout?: () => void;
  userName?: string;
  userRole?: string;
  isOpen?: boolean;
}

export function Sidebar({
  groups,
  activeItem,
  onItemClick,
  isOpen = false,
}: SidebarProps) {
  const active = groups.find((g) =>
    g.items.some((i) => i.path === activeItem),
  );
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    active ? [active.id] : [],
  );

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("sidebar-collapsed") === "true";
  });

  function toggleGroup(groupId: string) {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId],
    );
  }

  function toggleCollapsed() {
    setCollapsed((v) => {
      localStorage.setItem("sidebar-collapsed", String(!v));
      return !v;
    });
  }

  const classes = [
    "sidebar",
    isOpen ? "sidebar--open" : "",
    collapsed ? "sidebar--collapsed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <aside className={classes}>
      <div className="sidebar__header">
        <button
          type="button"
          className="sidebar__logo-btn"
          onClick={() => onItemClick("/")}
          title="Página inicial"
        >
          <img src={logo} alt="GD" className="sidebar__logo" />
        </button>
        <button
          type="button"
          className="sidebar__collapse-btn"
          onClick={toggleCollapsed}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
        </button>
      </div>

      <nav className="sidebar__nav" aria-label="Menu principal">
        {groups.map((group) => (
          <SidebarGroup
            key={group.id}
            group={group}
            isExpanded={expandedGroups.includes(group.id)}
            onToggle={() => toggleGroup(group.id)}
            activeItem={activeItem}
            onItemClick={onItemClick}
            isCollapsed={collapsed}
          />
        ))}
      </nav>
    </aside>
  );
}
