import { useState, useMemo, useEffect } from "react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { SummaryCards } from "../../../features/assistencias/logistica/SummaryCards";
import { Table } from "../../../features/assistencias/logistica/Table";
import { Modal } from "../../../features/assistencias/logistica/Modal";
import { useParamData } from "../../../hooks/useParamData";
import { fetchAssistencias } from "../../../services/assistenciaProducao";
import { fetchConfigDate, saveConfigDate } from "../../../services/utils";
import type {
  AssistanceProduction,
  AssistanceSummary,
} from "../../../types/assistenciaProducao";
import "../Producao/index.css";

function todayMinus90(): string {
  const d = new Date();
  d.setDate(d.getDate() - 90);
  return d.toISOString().split("T")[0];
}

function calcSummary(data: AssistanceProduction[]): AssistanceSummary {
  return {
    total: data.length,
    emAberto: data.filter((r) => r.status === "EM ABERTO").length,
    iniciadas: data.filter((r) => r.status === "INICIADO").length,
    prontas: data.filter((r) => r.status === "PRONTO").length,
    semMaterial: data.filter((r) => r.status === "SEM MATERIAL").length,
    entregues: data.filter((r) => r.status === "ENTREGUE").length,
  };
}

export function AssistenciasLogisticaPage() {
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [inputDate, setInputDate] = useState("");
  const [filterDate, setFilterDate] = useState<string | null>(null);

  useEffect(() => {
    fetchConfigDate(5)
      .then((d) => {
        const date = d || todayMinus90();
        setInputDate(date);
        setFilterDate(date);
      })
      .catch(() => {
        const date = todayMinus90();
        setInputDate(date);
        setFilterDate(date);
      });
  }, []);

  const {
    data: rows = [],
    loading,
    reload,
  } = useParamData(fetchAssistencias, filterDate);

  function handleDateKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && inputDate) {
      saveConfigDate(5, inputDate);
      if (filterDate === inputDate) reload();
      else setFilterDate(inputDate);
    }
  }

  function handleSaved() {
    reload();
    setViewingId(null);
  }

  const summary = useMemo(() => calcSummary(rows), [rows]);
  const count = rows.length;

  return (
    <AppLayout pageTitle="Assist — Logística">
      <div className="acp-page">
        <header className="acp-page__header">
          <div>
            <h1 className="acp-page__title">
              Controle de Assistências — Logística
            </h1>
            {!loading && (
              <p className="acp-page__subtitle">
                {count} assistência{count !== 1 ? "s" : ""} exibida
                {count !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <div className="acp-page__date-filter">
            <label className="acp-page__date-label">A partir de</label>
            <input
              className="acp-page__date-input"
              type="date"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              onKeyDown={handleDateKeyDown}
            />
          </div>
        </header>

        <SummaryCards summary={summary} loading={loading} />
        <Table
          data={rows}
          loading={loading}
          onRowClick={(row) => setViewingId(row.id)}
          storageKey="dt:assistencias-logistica"
        />
      </div>

      {viewingId && (
        <Modal
          isOpen
          id={viewingId}
          onClose={() => setViewingId(null)}
          onSaved={handleSaved}
        />
      )}
    </AppLayout>
  );
}
