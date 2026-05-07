import { useState, useMemo, useEffect } from "react";
import { FolderOpen, Layers, AlertTriangle, PackageCheck } from "lucide-react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { SummaryCard } from "../../../components/SummaryCard";
import { ProjectEnvironmentTable } from "../../../features/pending/ProjectEnvironmentTable";
import { PendingControlModal } from "../../../features/pending/PendingControlModal";
import { useApiData } from "../../../hooks/useApiData";
import { fetchPendingProjects } from "../../../services/pending";
import { computeItemStatus } from "../../../data/pendingConfig";
import type { PendingProject } from "../../../types/pending";
import { useToast } from "../../../context/ToastContext";
import "./index.css";

export function PendenciasPage() {
  const { data: fetched, loading } = useApiData(fetchPendingProjects);
  const toast = useToast();
  const [projects, setProjects] = useState<PendingProject[]>([]);
  const [selected, setSelected] = useState<PendingProject | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [inputContrato, setInputContrato] = useState("");
  const [searchContrato, setSearchContrato] = useState("");

  useEffect(() => {
    if (fetched) setProjects(fetched);
  }, [fetched]);

  function commitSearch(value: string) { setSearchContrato(value); }

  const filtered = useMemo(() => {
    if (!searchContrato.trim()) return [];
    const q = searchContrato.trim().toLowerCase();
    return projects.filter((p) => p.contrato.toLowerCase().includes(q));
  }, [projects, searchContrato]);

  const allItems        = useMemo(() => filtered.flatMap((p) => p.itens), [filtered]);
  const summaryProjetos  = filtered.length;
  const summaryItens     = allItems.length;
  const summaryAtrasados = allItems.filter((i) => computeItemStatus(i) === "atrasado").length;
  const summaryRecebidos = allItems.filter((i) => computeItemStatus(i) === "recebido").length;

  function handleSelect(project: PendingProject) {
    setSelected(project);
    setModalOpen(true);
  }

  function handleSave(updated: PendingProject) {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setModalOpen(false);
    toast.success("Pendência atualizada com sucesso.");
  }

  return (
    <AppLayout pageTitle="Pendências">
      <div className="pend-page">
        <div className="pend-page__top">
          <div>
            <h1 className="pend-page__title">Controle de Pendências</h1>
            <p className="pend-page__subtitle">
              {loading
                ? "Carregando..."
                : searchContrato.trim()
                  ? `${filtered.length} projeto${filtered.length !== 1 ? "s" : ""} encontrado${filtered.length !== 1 ? "s" : ""}`
                  : "Busque um contrato para exibir os resultados"}
            </p>
          </div>
          <label className="pend-filter-label">
            <span>Buscar contrato</span>
            <input
              type="text"
              className="pend-filter-input"
              placeholder="Ex: CT-001"
              value={inputContrato}
              onChange={(e) => setInputContrato(e.target.value)}
              onBlur={(e) => commitSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && commitSearch(inputContrato)}
            />
          </label>
        </div>

        <div className="pend-summary">
          <SummaryCard label="Projetos"       value={summaryProjetos}  accent="var(--accent)" icon={<FolderOpen    size={13} />} loading={loading} />
          <SummaryCard label="Total de Itens" value={summaryItens}     accent="var(--accent)" icon={<Layers        size={13} />} loading={loading} />
          <SummaryCard label="Atrasados"      value={summaryAtrasados} accent="#dc2626"        icon={<AlertTriangle size={13} />} loading={loading} />
          <SummaryCard label="Recebidos"      value={summaryRecebidos} accent="#16a34a"        icon={<PackageCheck  size={13} />} loading={loading} />
        </div>

        <ProjectEnvironmentTable projects={filtered} onSelect={handleSelect} loading={loading} />
      </div>

      <PendingControlModal
        isOpen={modalOpen}
        project={selected}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </AppLayout>
  );
}