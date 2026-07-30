import { useState, useMemo } from "react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { ForecastSummaryCards } from "../../../features/forecast/ForecastSummaryCards";
import { ForecastTable } from "../../../features/forecast/ForecastTable";
import { ForecastDetailsModal } from "../../../features/forecast/ForecastDetailsModal";
import { useApiData } from "../../../hooks/useApiData";
import { fetchForecastProjects } from "../../../services/forecast";
import type { ForecastProject } from "../../../types/forecast";
import "./index.css";

export function PlanejamentoPage() {
  const { data: projects = [], loading } = useApiData(fetchForecastProjects);
  const [selectedProject, setSelectedProject] = useState<ForecastProject | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const summary = useMemo(
    () => ({
      total:     projects.length,
      iniciados: projects.filter((p) => p.status === "INICIADO").length,
      atrasados: projects.filter((p) => p.status === "ATRASADO").length,
      aVencer:   projects.filter((p) => p.status === "A VENCER").length,
    }),
    [projects],
  );

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
                {projects.length} projeto{projects.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        <ForecastSummaryCards {...summary} loading={loading} />
        <ForecastTable projects={projects} onSelect={handleSelect} loading={loading} />
      </div>

      <ForecastDetailsModal
        isOpen={modalOpen}
        project={selectedProject}
        onClose={() => setModalOpen(false)}
      />
    </AppLayout>
  );
}