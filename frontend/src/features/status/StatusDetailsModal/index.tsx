import { useState, useEffect, useMemo } from "react";
import { Modal } from "../../../components/Modal";
import { StatusBadge } from "../StatusBadge";
import { ProjectInfoSection } from "./sections/ProjectInfoSection";
import { AcessoriosTable } from "../../../components/AcessoriosTable";
import type { AcessorioRow } from "../../../components/AcessoriosTable";
import { ProductionStageCard } from "../../../components/ProductionStageCard";
import { fetchStatusDetail } from "../../../services/status";
import { fetchPendingItems } from "../../../services/pending";
import { fmtDate as fmtDateUtil } from "../../../utils/dateUtils";
import type { PendingItem } from "../../../types/pending";
import type { StatusProject, StatusProjectDetail } from "../../../types/status";

function fmtDate(iso: string | null | undefined): string {
  return fmtDateUtil(iso) || "—";
}

const STAGE_DEFS: {
  key: keyof StatusProjectDetail["stages"];
  label: string;
}[] = [
  { key: "corte", label: "Corte" },
  { key: "coladeira", label: "Coladeira" },
  { key: "customizacao", label: "Customização" },
  { key: "usinagem", label: "Usinagem" },
  { key: "paineis", label: "Painéis" },
  { key: "montagem", label: "Montagem" },
  { key: "acabamento", label: "Acabamento" },
  { key: "embalagem", label: "Embalagem" },
];

interface StatusDetailsModalProps {
  isOpen: boolean;
  project: StatusProject | null;
  onClose: () => void;
}

export function StatusDetailsModal({
  isOpen,
  project,
  onClose,
}: StatusDetailsModalProps) {
  const [detail, setDetail] = useState<StatusProjectDetail | null>(null);
  const [accessories, setAccessories] = useState<PendingItem[]>([]);
  const [loadingDetail, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && project) {
      setDetail(null);
      setAccessories([]);
      setLoading(true);
      Promise.all([
        fetchStatusDetail(project.numOC),
        fetchPendingItems(Number(project.numOC)),
      ])
        .then(([det, acc]) => {
          setDetail(det);
          setAccessories(acc);
        })
        .catch(() => {
          setDetail(null);
          setAccessories([]);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, project?.numOC]);

  const accessoryRows = useMemo<AcessorioRow[]>(
    () =>
      accessories.map((a) => ({
        id: String(a.id),
        descricao: a.descricao,
        medida: a.medida,
        qtd: a.qtd,
        compra: a.compra ? a.compra.split("-").reverse().join("/") : "—",
        previsao: a.previsao ? a.previsao.split("-").reverse().join("/") : "—",
        recebido: a.recebido ? a.recebido.split("-").reverse().join("/") : "",
      })),
    [accessories],
  );

  const title = project
    ? `${project.numOC} — ${project.cliente}`
    : "Detalhes do Projeto";

  return (
    <Modal title={title} isOpen={isOpen} onClose={onClose} maxWidth={1060}>
      {project && (
        <div className="plan-modal">
          {/* 1 — Identificação */}
          <section className="plan-modal__section">
            <div className="plan-modal__section-header">
              <h3 className="plan-modal__section-title">
                Identificação do Projeto
              </h3>
              <StatusBadge status={project.status} />
            </div>
            <ProjectInfoSection project={project} lote={detail?.lote} />
          </section>

          {/* 2 — Etapas de produção */}
          <section className="plan-modal__section">
            <h3 className="plan-modal__section-title">Etapas de Produção</h3>
            {loadingDetail ? (
              <p className="plan-modal__empty">Carregando...</p>
            ) : detail ? (
              <div className="plan-modal__stages-grid">
                {STAGE_DEFS.map((s, i) => {
                  const stage = detail.stages[s.key];
                  return (
                    <ProductionStageCard
                      key={s.key}
                      index={i + 1}
                      label={s.label}
                      status={stage.status}
                      inicio={stage.inicio}
                      fim={stage.fim}
                    />
                  );
                })}
              </div>
            ) : (
              <p className="plan-modal__empty">Dados não disponíveis.</p>
            )}
          </section>

          {/* 3 — Expedição */}
          {detail && (
            <section className="plan-modal__section">
              <h3 className="plan-modal__section-title">Expedição</h3>
              <div className="plan-modal__info-grid">
                <div className="plan-field">
                  <label>Tamanho</label>
                  <input
                    type="text"
                    value={detail.tamanho || "—"}
                    disabled
                    readOnly
                  />
                </div>
                <div className="plan-field">
                  <label>Total de Volumes</label>
                  <input
                    type="text"
                    value={detail.totalVolumes || "—"}
                    disabled
                    readOnly
                  />
                </div>
                <div className="plan-field">
                  <label>Pronto em</label>
                  <input
                    type="text"
                    value={fmtDate(detail.pronto)}
                    disabled
                    readOnly
                  />
                </div>
                <div className="plan-field">
                  <label>Entregue em</label>
                  <input
                    type="text"
                    value={fmtDate(detail.entregue)}
                    disabled
                    readOnly
                  />
                </div>
              </div>
            </section>
          )}

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

          {/* 5 — Materiais */}
          <section className="plan-modal__section">
            <h3 className="plan-modal__section-title">Materiais</h3>
            {loadingDetail ? (
              <p className="plan-modal__empty">Carregando...</p>
            ) : (
              <AcessoriosTable
                rows={accessoryRows}
                emptyMessage="Nenhum material cadastrado."
              />
            )}
          </section>
        </div>
      )}
    </Modal>
  );
}
