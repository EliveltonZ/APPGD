import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { Sidebar } from "../Sidebar";
import { menuGroups } from "../../data/menuConfig";
import { useAuth } from "../../context/AuthContext";
import { hasPermission } from "../../types/auth";
import { ConfirmModal } from "../ConfirmModal";
import type { ReactNode } from "react";
import type { MenuGroup } from "../../types/menu";
import "./AppLayout.css";

interface AppLayoutProps {
  children: ReactNode;
  pageTitle?: string;
  /** Sobrescreve o menu padrão da aplicação. Omitir usa menuGroups de menuConfig. */
  groups?: MenuGroup[];
}

function toCapitalize(str: string) {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AppLayout({ children, pageTitle, groups: groupsProp }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const visibleGroups = useMemo(() => {
    if (!user) return [];
    return (groupsProp ?? menuGroups)
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => hasPermission(user, item.path)),
      }))
      .filter((group) => group.items.length > 0);
  }, [user]);

  function handleItemClick(path: string) {
    setSidebarOpen(false);
    navigate(path);
  }

  function handleLogout() {
    setSaveConfirmOpen(true);
  }

  return (
    <div className="app-layout">
      {sidebarOpen && (
        <div
          className="app-layout__overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        groups={visibleGroups}
        activeItem={location.pathname}
        onItemClick={handleItemClick}
        isOpen={sidebarOpen}
      />

      <div className="app-layout__body">
        <header className="app-header">
          <button
            className="app-header__toggle"
            onClick={() => setSidebarOpen((v) => !v)}
            type="button"
            aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {pageTitle && <span className="app-header__title">{pageTitle}</span>}

          <div className="app-header__spacer" />

          {user && (
            <div className="app-header__user">
              <span className="app-header__user-name">{toCapitalize(user.nome)}</span>
              <span className="app-header__user-role">{user.role}</span>
            </div>
          )}

          <button
            className="app-header__logout"
            onClick={handleLogout}
            type="button"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        </header>

        <main className="app-layout__content">{children}</main>
      </div>

      <ConfirmModal
        isOpen={saveConfirmOpen}
        message="Deseja fazer logout ?"
        confirmLabel="Confirmar"
        onConfirm={() => {
          setSaveConfirmOpen(false);
          logout();
          navigate("/login", { replace: true });
        }}
        onCancel={() => setSaveConfirmOpen(false)}
      />
    </div>
  );
}
