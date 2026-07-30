import { useState } from "react";
import { Monitor, Factory, DollarSign } from "lucide-react";
import { ProjetosProvider } from "./projetos/context";
import { ProjetosFilters }  from "./projetos/filters";
import { ProjetosCharts }   from "./projetos/charts";
import { ProducaoProvider } from "./producao/context";
import { ProducaoFilters }  from "./producao/filters";
import { ProducaoCharts }   from "./producao/charts";
import { FinanceiroFilters, FinanceiroCharts } from "./financeiro";
import "./index.css";

type Tab = "projetos" | "producao" | "financeiro";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "projetos",   label: "Projetos",   icon: <Monitor    size={14} /> },
  { id: "producao",   label: "Produção",   icon: <Factory    size={14} /> },
  { id: "financeiro", label: "Financeiro", icon: <DollarSign size={14} /> },
];

export function DashboardsPrincipalPage() {
  const [tab, setTab] = useState<Tab>("projetos");

  return (
    <ProjetosProvider>
      <ProducaoProvider>
        <div className="proj-dash">
          {/* ── Left panel ── */}
          <div className="proj-dash__panel">
            <div className="proj-dash__brand">
              <span className="proj-dash__brand-text">GD</span>
              <span className="proj-dash__brand-label">Dashboard</span>
            </div>

            <div className="proj-dash__tabs">
              {TABS.map(({ id, label, icon }) => (
                <button
                  key={id}
                  type="button"
                  className={`proj-dash__tab${tab === id ? " proj-dash__tab--active" : ""}`}
                  onClick={() => setTab(id)}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>

            {tab === "projetos"   && <ProjetosFilters />}
            {tab === "producao"   && <ProducaoFilters />}
            {tab === "financeiro" && <FinanceiroFilters />}
          </div>

          {/* ── Main content ── */}
          <div className="proj-dash__main">
            {tab === "projetos"   && <ProjetosCharts />}
            {tab === "producao"   && <ProducaoCharts />}
            {tab === "financeiro" && <FinanceiroCharts />}
          </div>
        </div>
      </ProducaoProvider>
    </ProjetosProvider>
  );
}
