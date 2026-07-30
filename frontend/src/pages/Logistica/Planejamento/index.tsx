import { useState, useMemo, useCallback } from "react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { ForecastSummaryCards } from "../../../features/forecast/ForecastSummaryCards";
import { ForecastTable } from "../../../features/forecast/ForecastTable";
import type { ForecastRow } from "../../../features/forecast/ForecastTable";
import { ForecastDetailsModal } from "../../../features/forecast/ForecastDetailsModal";
import { useApiData } from "../../../hooks/useApiData";
import { fetchForecastProjects } from "../../../services/forecast";
import type { ForecastProject } from "../../../types/forecast";
import "./index.css";

export function PlanejamentoPage() {
  const { data: projects = [], loading } = useApiData(fetchForecastProjects);
  const [selectedProject, setSelectedProject] =
    useState<ForecastProject | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filteredRows, setFilteredRows] = useState<ForecastRow[]>([]);

  const summary = useMemo(
    () => ({
      total:     filteredRows.length,
      atrasados: filteredRows.filter((r) => r.status === "ATRASADO").length,
      aVencer:   filteredRows.filter((r) => r.status === "A VENCER").length,
      iniciados: filteredRows.filter((r) => r.status === "INICIADO").length,
    }),
    [filteredRows],
  );

  const handleFilteredRowsChange = useCallback((rows: ForecastRow[]) => {
    setFilteredRows(rows);
  }, []);

  function handleSelect(project: ForecastProject) {
    setSelectedProject(project);
    setModalOpen(true);
  }

  return (
    <AppLayout pageTitle="Planejamento">
      <div className="plan-page">
        <div className="plan-page__top">
          <div>
            <h1 className="plan-page__title">Planejamento de Produção</h1>
            {!loading && (
              <p className="plan-page__subtitle">
                {summary.total} projeto{summary.total !== 1 ? "s" : ""} em
                produção
              </p>
            )}
          </div>
        </div>

        <ForecastSummaryCards {...summary} loading={loading} />
        <ForecastTable
          projects={projects}
          onSelect={handleSelect}
          onFilteredRowsChange={handleFilteredRowsChange}
          loading={loading}
        />
      </div>

      <ForecastDetailsModal
        isOpen={modalOpen}
        project={selectedProject}
        onClose={() => setModalOpen(false)}
      />
    </AppLayout>
  );
}
