import { useState, useMemo, useEffect } from "react";
import { X } from "lucide-react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { StatusSummaryCards } from "../../../features/status/StatusSummaryCards";
import { StatusTable } from "../../../features/status/StatusTable";
import { StatusDetailsModal } from "../../../features/status/StatusDetailsModal";
import { useParamData } from "../../../hooks/useParamData";
import { fetchStatusProjects } from "../../../services/status";
import { fetchConfigDate, saveConfigDate } from "../../../services/utils";
import type { StatusProject } from "../../../types/status";
import "./index.css";

const CONFIG_DATE_ID = 4;

export function LogisticaStatusPage() {
  const [inputDate, setInputDate] = useState("");
  const [filterDate, setFilterDate] = useState<string | null>(null);
  const [selected, setSelected] = useState<StatusProject | null>(null);

  useEffect(() => {
    fetchConfigDate(CONFIG_DATE_ID)
      .then((d) => {
        setInputDate(d ?? "");
        setFilterDate(d ?? "");
      })
      .catch(() => {
        setFilterDate("");
      });
  }, []);

  const { data: projects = [], loading, reload } = useParamData(
    fetchStatusProjects,
    filterDate,
  );

  function handleEnter() {
    saveConfigDate(CONFIG_DATE_ID, inputDate);
    if (filterDate === inputDate) reload();
    else setFilterDate(inputDate);
  }

  function handleClear() {
    setInputDate("");
    if (filterDate === "") reload();
    else setFilterDate("");
  }

  function isIncludes(p: string) {
    return [
      "INICIADO",
      "A VENCER",
      "URGENTE",
      "PARCEADO",
      "PENDENCIA",
      "PRONTO",
    ].includes(p);
  }

  const counts = useMemo(
    () => ({
      aguardando:  projects.filter((p) => p.status === "AGUARDANDO").length,
      em_producao: projects.filter((p) => isIncludes(p.status)).length,
      atrasado:    projects.filter((p) => p.status === "ATRASADO").length,
      entregues:   projects.filter((p) => p.status === "ENTREGUE").length,
    }),
    [projects],
  );

  return (
    <AppLayout pageTitle="Situação">
      <div className="st-page">
        <div className="st-page__top">
          <div>
            <h1 className="st-page__title">Situação</h1>
            {!loading && (
              <p className="st-page__subtitle">
                {projects.length} projeto{projects.length !== 1 ? "s" : ""}{" "}
                encontrado{projects.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <div className="st-date-filter">
            <span className="st-date-filter__label">Entrega a partir de</span>
            <input
              type="date"
              className="st-date-filter__input"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleEnter(); }}
            />
            {filterDate !== null && filterDate !== "" && (
              <button
                type="button"
                className="st-date-filter__clear"
                onClick={handleClear}
                title="Limpar filtro"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        <StatusSummaryCards counts={counts} loading={loading} />
        <StatusTable
          projects={projects}
          onRowClick={setSelected}
          loading={loading}
        />

        <StatusDetailsModal
          isOpen={selected !== null}
          project={selected}
          onClose={() => setSelected(null)}
        />
      </div>
    </AppLayout>
  );
}
