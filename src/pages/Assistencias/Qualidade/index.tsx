import { useState, useMemo, useEffect } from "react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { QualitySummaryCards } from "../../../features/assistencias/qualidade/QualitySummaryCards";
import { QualityTable } from "../../../features/assistencias/qualidade/QualityTable";
import { QualityAnalysisModal } from "../../../features/assistencias/qualidade/QualityAnalysisModal";
import { useApiData } from "../../../hooks/useApiData";
import { fetchQualityItems } from "../../../services/qualidade";
import { ConfirmModal } from "../../../components/ConfirmModal";
import type {
  QualityItem,
  QualitySummary,
} from "../../../types/qualityControl";
import { useToast } from "../../../context/ToastContext";
import "./index.css";

function calcSummary(data: QualityItem[]): QualitySummary {
  return {
    total: data.length,
    pendentes: data.filter((r) => r.status === "pendente").length,
    analisados: data.filter((r) => r.status === "analisado").length,
  };
}

export function AssistenciasQualidadePage() {
  const { data: fetched, loading } = useApiData(fetchQualityItems);
  const [data, setData] = useState<QualityItem[]>([]);
  const [editing, setEditing] = useState<QualityItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (fetched) setData(fetched);
  }, [fetched]);

  const summary = useMemo(() => calcSummary(data), [data]);

  function handleRowClick(row: QualityItem) {
    setEditing({ ...row });
  }
  function handleClose() {
    setEditing(null);
  }

  function handleChange<K extends keyof QualityItem>(
    key: K,
    value: QualityItem[K],
  ) {
    setEditing((prev) => (prev ? { ...prev, [key]: value } : null));
  }

  function handleSave() {
    // backend deve ser chamado aqui
    if (!editing) return;
    setIsOpen(false);
    const saved: QualityItem = {
      ...editing,
      status: editing.causaRaiz.trim() ? "analisado" : "pendente",
    };
    setData((prev) => prev.map((r) => (r.id === saved.id ? saved : r)));
    setEditing(null);
    toast.success("Analise concluida com sucesso !!!");
  }

  return (
    <AppLayout pageTitle="Assistências — Qualidade">
      <div className="qcp-page">
        <header className="qcp-page__header">
          <div>
            <h1 className="qcp-page__title">Controle de Qualidade</h1>
            {!loading && (
              <p className="qcp-page__subtitle">
                {data.length} item{data.length !== 1 ? "s" : ""}
                {summary.pendentes > 0 &&
                  ` · ${summary.pendentes} pendente${summary.pendentes !== 1 ? "s" : ""}`}
              </p>
            )}
          </div>
        </header>

        <QualitySummaryCards summary={summary} loading={loading} />
        <QualityTable
          data={data}
          loading={loading}
          onRowClick={handleRowClick}
        />
      </div>

      {editing && (
        <QualityAnalysisModal
          isOpen
          onClose={handleClose}
          data={editing}
          onChange={handleChange}
          onSave={() => setIsOpen(true)}
        />
      )}

      <ConfirmModal
        isOpen={isOpen}
        message="Deseja salvar analise ?"
        onConfirm={handleSave}
        onCancel={() => setIsOpen(false)}
      />
    </AppLayout>
  );
}
