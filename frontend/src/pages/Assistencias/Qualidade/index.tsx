import { useState, useMemo, useEffect, useCallback } from "react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { QualitySummaryCards } from "../../../features/assistencias/qualidade/QualitySummaryCards";
import { QualityTable } from "../../../features/assistencias/qualidade/QualityTable";
import { QualityAnalysisModal } from "../../../features/assistencias/qualidade/QualityAnalysisModal";
import {
  fetchQualityItems,
  fetchCausaFalha,
  saveQualityAnalysis,
} from "../../../services/qualidade";
import { fetchFalhasConfig } from "../../../services/assistencia";
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
  const [data, setData] = useState<QualityItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [editing, setEditing] = useState<QualityItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [falhaOptions, setFalhaOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  const [causaOptions, setCausaOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  const toast = useToast();

  const load = useCallback(() => {
    setLoading(true);

    fetchQualityItems()
      .then(setData)
      .catch(() => {
        setData([]);
        toast.error("Erro ao carregar os itens de qualidade.");
      })
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    fetchFalhasConfig()
      .then((items) =>
        setFalhaOptions(
          items.map((f) => ({
            value: String(f.id),
            label: f.label,
          })),
        ),
      )
      .catch(() => {
        setFalhaOptions([]);
      });
  }, []);

  const summary = useMemo(() => calcSummary(data), [data]);

  function handleRowClick(row: QualityItem) {
    setEditing({ ...row });

    const falhaId = Number(row.falha);

    if (falhaId) {
      fetchCausaFalha(falhaId)
        .then(setCausaOptions)
        .catch(() => setCausaOptions([]));
    } else {
      setCausaOptions([]);
    }
  }

  function handleClose() {
    setEditing(null);
    setCausaOptions([]);
  }

  function handleChange<K extends keyof QualityItem>(
    key: K,
    value: QualityItem[K],
  ) {
    setEditing((prev) =>
      prev
        ? {
            ...prev,
            [key]: value,
          }
        : null,
    );

    if (key === "falha") {
      const id = Number(value);

      if (id) {
        fetchCausaFalha(id)
          .then(setCausaOptions)
          .catch(() => setCausaOptions([]));
      } else {
        setCausaOptions([]);
      }
    }
  }

  async function handleSave() {
    if (!editing) return;

    setIsOpen(false);

    try {
      await saveQualityAnalysis({
        id: editing.id,
        idErp: editing.idErp,
        falha: editing.falha,
        causa: editing.causa,
        causaRaiz: editing.causaRaiz,
      });

      const saved: QualityItem = {
        ...editing,
        status: editing.causaRaiz.trim() ? "analisado" : "pendente",
      };

      setData((prev) => prev.map((r) => (r.id === saved.id ? saved : r)));

      setEditing(null);
      setCausaOptions([]);

      toast.success("Análise concluída com sucesso!");
    } catch {
      toast.error("Erro ao salvar análise. Tente novamente.");
    }
  }

  return (
    <AppLayout pageTitle="Assist — Qualidade">
      <div className="qcp-page">
        <header className="qcp-page__header">
          <div>
            <h1 className="qcp-page__title">Controle de Qualidade</h1>

            {!loading && (
              <p className="qcp-page__subtitle">
                {data.length} item
                {data.length !== 1 ? "s" : ""}
                {summary.pendentes > 0 &&
                  ` · ${summary.pendentes} pendente${
                    summary.pendentes !== 1 ? "s" : ""
                  }`}
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
          falhaOptions={falhaOptions}
          causaOptions={causaOptions}
        />
      )}

      <ConfirmModal
        isOpen={isOpen}
        message="Deseja salvar análise?"
        onConfirm={handleSave}
        onCancel={() => setIsOpen(false)}
      />
    </AppLayout>
  );
}
