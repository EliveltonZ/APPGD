import { useState, useMemo } from "react";
import { X } from "lucide-react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { StatusSummaryCards } from "../../../features/status/StatusSummaryCards";
import { StatusTable } from "../../../features/status/StatusTable";
import { StatusDetailsModal } from "../../../features/status/StatusDetailsModal";
import { useApiData } from "../../../hooks/useApiData";
import { fetchStatusProjects } from "../../../services/status";
import type { StatusProject } from "../../../types/status";
import "./index.css";

export function LogisticaStatusPage() {
  const { data: projects = [], loading } = useApiData(fetchStatusProjects);
  const [filterDate, setFilterDate] = useState("");
  const [selected, setSelected] = useState<StatusProject | null>(null);

  const filtered = useMemo(() => {
    if (!filterDate) return projects;
    return projects.filter((p) => p.entrega >= filterDate);
  }, [projects, filterDate]);

  const counts = useMemo(
    () => ({
      aguardando:  projects.filter((p) => p.status === "aguardando").length,
      em_producao: projects.filter((p) => p.status === "em_producao").length,
      concluido:   projects.filter((p) => p.status === "concluido").length,
      atrasado:    projects.filter((p) => p.status === "atrasado").length,
    }),
    [projects],
  );

  return (
    <AppLayout pageTitle="Situação">
      <div className="st-page">
        <div className="st-page__top">
          <div>
            <h1 className="st-page__title">Situação</h1>
            {!loading && (
              <p className="st-page__subtitle">
                Acompanhamento dos projetos em produção — {filtered.length} de{" "}
                {projects.length} projetos
              </p>
            )}
          </div>
          <div className="st-date-filter">
            <span className="st-date-filter__label">Entrega a partir de</span>
            <input
              type="date"
              className="st-date-filter__input"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            {filterDate && (
              <button
                type="button"
                className="st-date-filter__clear"
                onClick={() => setFilterDate("")}
                title="Limpar filtro"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        <StatusSummaryCards counts={counts} loading={loading} />
        <StatusTable projects={filtered} onRowClick={setSelected} loading={loading} />

        <StatusDetailsModal
          isOpen={selected !== null}
          project={selected}
          onClose={() => setSelected(null)}
        />
      </div>
    </AppLayout>
  );
}