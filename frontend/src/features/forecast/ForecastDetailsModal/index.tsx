import { useState, useEffect, useMemo } from "react";
import { Modal } from "../../../components/Modal";
import { StatusBadge } from "../StatusBadge";
import { FORECAST_PROJECT_STATUS_LABELS } from "../../../data/forecastConfig";
import { ProjectInfoSection } from "./sections/ProjectInfoSection";
import { ProductionStagesTimeline } from "./sections/ProductionStagesTimeline";
import { AcessoriosTable } from "../../../components/AcessoriosTable";
import type { AcessorioRow } from "../../../components/AcessoriosTable";
import { fetchForecastDetail } from "../../../services/forecast";
import { fetchPendingItems, fetchAccessoryPurchases } from "../../../services/pending";
import type { PendingItem } from "../../../types/pending";
import type { ForecastProject, ForecastProjectDetail } from "../../../types/forecast";
import "./index.css";

interface ForecastDetailsModalProps {
  isOpen:  boolean;
  project: ForecastProject | null;
  onClose: () => void;
}

export function ForecastDetailsModal({ isOpen, project, onClose }: ForecastDetailsModalProps) {
  const [detail, setDetail]           = useState<ForecastProjectDetail | null>(null);
  const [accessories, setAccessories] = useState<PendingItem[]>([]);
  const [purchases, setPurchases]     = useState<AcessorioRow[]>([]);
  const [loading, setLoading]         = useState(false);

  useEffect(() => {
    if (isOpen && project) {
      setDetail(null);
      setAccessories([]);
      setPurchases([]);
      setLoading(true);
      Promise.all([
        fetchForecastDetail(project.id),
        fetchPendingItems(project.id),
        fetchAccessoryPurchases(project.id),
      ])
        .then(([det, acc, comp]) => { setDetail(det); setAccessories(acc); setPurchases(comp); })
        .catch(() => { setDetail(null); setAccessories([]); setPurchases([]); })
        .finally(() => setLoading(false));
    }
  }, [isOpen, project?.id]);

  const accessoryRows = useMemo<AcessorioRow[]>(
    // Rastreamento de compra/previsão/recebimento ainda não existe nessa
    // versão da fonte de dados (tblXmlConsumo) — fica em branco até essa
    // etapa ser migrada também.
    () => accessories.map((a) => ({
      id:        String(a.id),
      descricao: a.descricao ?? "",
      medida:    a.detalhes ?? "",
      qtd:       a.quantidade,
      compra:    "",
      previsao:  "",
      recebido:  "",
    })),
    [accessories],
  );

  const title = project ? `${project.numOC} — ${project.cliente}` : "Detalhes do Projeto";

  return (
    <Modal title={title} isOpen={isOpen} onClose={onClose} maxWidth={1060}>
      {project && (
        <div className="plan-modal">

          {/* 1 — Identificação */}
          <section className="plan-modal__section">
            <div className="plan-modal__section-header">
              <h3 className="plan-modal__section-title">Identificação do Projeto</h3>
              <StatusBadge
                status={project.status}
                label={FORECAST_PROJECT_STATUS_LABELS[project.status]}
              />
            </div>
            <ProjectInfoSection project={project} detail={detail} />
          </section>

          {/* 2 — Etapas produtivas */}
          <section className="plan-modal__section">
            <h3 className="plan-modal__section-title">Etapas Produtivas</h3>
            {loading ? (
              <p className="plan-modal__empty">Carregando...</p>
            ) : detail ? (
              <ProductionStagesTimeline detail={detail} />
            ) : (
              <p className="plan-modal__empty">Dados não disponíveis.</p>
            )}
          </section>

          {/* 3 — Itens Pedido */}
          <section className="plan-modal__section">
            <h3 className="plan-modal__section-title">Itens Pedido</h3>
            {loading ? (
              <p className="plan-modal__empty">Carregando...</p>
            ) : (
              <AcessoriosTable rows={accessoryRows} emptyMessage="Nenhum item lançado." />
            )}
          </section>

          {/* 3.1 — Compras (Acessórios) */}
          <section className="plan-modal__section">
            <h3 className="plan-modal__section-title">Compras (Acessórios)</h3>
            {loading ? (
              <p className="plan-modal__empty">Carregando...</p>
            ) : (
              <AcessoriosTable rows={purchases} emptyMessage="Nenhuma compra cadastrada." />
            )}
          </section>

          {/* 4 — Observações */}
          {detail?.observacoes && (
            <section className="plan-modal__section">
              <h3 className="plan-modal__section-title">Observações</h3>
              <textarea
                className="plan-modal__textarea"
                value={detail.observacoes}
                disabled
                rows={3}
              />
            </section>
          )}

        </div>
      )}
    </Modal>
  );
}
