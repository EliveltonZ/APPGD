import { useState, useMemo, useEffect } from "react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { SummaryCards } from "../../../features/assistencias/producao/SummaryCards";
import { Table } from "../../../features/assistencias/producao/Table";
import { Modal } from "../../../features/assistencias/producao/Modal";
import { useParamData } from "../../../hooks/useParamData";
import { fetchAssistencias } from "../../../services/assistenciaProducao";
import { fetchConfigDate, saveConfigDate } from "../../../services/utils";
import type {
  AssistanceProduction,
  AssistanceSummary,
} from "../../../types/assistenciaProducao";
import "./index.css";

function todayMinus90(): string {
  const d = new Date();
  d.setDate(d.getDate() - 90);
  return d.toISOString().split("T")[0];
}

function countStatus(data: AssistanceProduction[], status: string): number {
  return data.filter((r) => r.status === status).length;
}

function calcSummary(data: AssistanceProduction[]): AssistanceSummary {
  return {
    total: data.length,
    emAberto: countStatus(data, "EM ABERTO"),
    iniciadas: countStatus(data, "INICIADO"),
    prontas: countStatus(data, "PRONTO"),
    semMaterial: countStatus(data, "SEM MATERIAL"),
    entregues: countStatus(data, "ENTREGUE"),
  };
}

export function AssistenciasProducaoPage() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inputDate, setInputDate] = useState("");
  const [filterDate, setFilterDate] = useState<string | null>(null);

  useEffect(() => {
    fetchConfigDate(5).then((d) => {
      const date = d || todayMinus90();
      setInputDate(date);
      setFilterDate(date);
    }).catch(() => {
      const date = todayMinus90();
      setInputDate(date);
      setFilterDate(date);
    });
  }, []);

  const { data: rows = [], loading, reload } = useParamData(fetchAssistencias, filterDate);

  function handleDateKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && inputDate) {
      saveConfigDate(5, inputDate);
      if (filterDate === inputDate) reload();
      else setFilterDate(inputDate);
    }
  }

  const summary = useMemo(() => calcSummary(rows), [rows]);

  function handleSaved() {
    reload();
    setEditingId(null);
  }

  function handleClose() {
    setEditingId(null);
  }

  const count = rows.length;

  return (
    <AppLayout pageTitle="Assistências — Produção">
      <div className="acp-page">
        <header className="acp-page__header">
          <div>
            <h1 className="acp-page__title">
              Controle de Assistências — Produção
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
        <Table data={rows} loading={loading} onRowClick={(row) => setEditingId(row.id)} />
      </div>

      {editingId && (
        <Modal
          isOpen
          id={editingId}
          onClose={handleClose}
          onSaved={handleSaved}
          producaoMode
        />
      )}
    </AppLayout>
  );
}
