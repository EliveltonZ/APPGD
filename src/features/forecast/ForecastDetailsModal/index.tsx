import { Modal } from "../../../components/Modal";
import { StatusBadge } from "../StatusBadge";
import { FORECAST_PROJECT_STATUS_LABELS } from "../../../data/forecastConfig";
import { ProjectInfoSection } from "./sections/ProjectInfoSection";
import { ProductionStagesTimeline } from "./sections/ProductionStagesTimeline";
import { RelatedPurchasesTable } from "./sections/RelatedPurchasesTable";
import type { ForecastProject } from "../../../types/forecast";
import "./index.css";

interface ForecastDetailsModalProps {
  isOpen: boolean;
  project: ForecastProject | null;
  onClose: () => void;
}

export function ForecastDetailsModal({
  isOpen,
  project,
  onClose,
}: ForecastDetailsModalProps) {
  const title = project
    ? `${project.numOC} — ${project.cliente}`
    : "Detalhes do Projeto";

  return (
    <Modal title={title} isOpen={isOpen} onClose={onClose} maxWidth={1060}>
      {project && (
        <div className="plan-modal">
          {/* ── 1. Identificação ───────────────────────── */}
          <section className="plan-modal__section">
            <div className="plan-modal__section-header">
              <h3 className="plan-modal__section-title">
                Identificação do Projeto
              </h3>
              <StatusBadge
                status={project.status}
                label={FORECAST_PROJECT_STATUS_LABELS[project.status]}
              />
            </div>
            <ProjectInfoSection project={project} />
          </section>

          {/* ── 2. Etapas produtivas ────────────────────── */}
          <section className="plan-modal__section">
            <h3 className="plan-modal__section-title">Etapas Produtivas</h3>
            <ProductionStagesTimeline project={project} />
          </section>

          {/* ── 3. Observações ──────────────────────────── */}
          {project.observacoes && (
            <section className="plan-modal__section">
              <h3 className="plan-modal__section-title">Observações</h3>
              <textarea
                className="plan-modal__textarea"
                value={project.observacoes}
                disabled
                rows={3}
              />
            </section>
          )}

          {/* ── 4. Compras / Acessórios ─────────────────── */}
          <section className="plan-modal__section">
            <h3 className="plan-modal__section-title">Compras / Acessórios</h3>
            <RelatedPurchasesTable materials={project.materials} />
          </section>
        </div>
      )}
    </Modal>
  );
}
