import { useState, useMemo } from "react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { ForecastSummaryCards } from "../../../features/forecast/ForecastSummaryCards";
import { ForecastTable } from "../../../features/forecast/ForecastTable";
import { ForecastDetailsModal } from "../../../features/forecast/ForecastDetailsModal";
import { mockForecastProjects } from "../../../data/forecastMocks";
import type { ForecastProject } from "../../../types/forecast";
import "./index.css";

export function PlanejamentoPage() {
  const [projects] = useState(mockForecastProjects);
  const [selectedProject, setSelectedProject] =
    useState<ForecastProject | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const summary = useMemo(
    () => ({
      total: projects.length,
      emProducao: projects.filter((p) => p.status === "em_producao").length,
      atrasados: projects.filter((p) => p.status === "atrasado").length,
      aguardandoPrevisao: projects.filter((p) => !p.previsao).length,
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
            <p className="plan-page__subtitle"></p>
          </div>
        </div>

        <ForecastSummaryCards {...summary} />

        <ForecastTable projects={projects} onSelect={handleSelect} />
      </div>

      <ForecastDetailsModal
        isOpen={modalOpen}
        project={selectedProject}
        onClose={() => setModalOpen(false)}
      />
    </AppLayout>
  );
}
