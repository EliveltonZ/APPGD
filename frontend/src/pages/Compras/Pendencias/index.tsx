import { useState } from "react";
import { FolderOpen, Layers, AlertTriangle, PackageCheck } from "lucide-react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { SummaryCard } from "../../../components/SummaryCard";
import { ProjectEnvironmentTable } from "../../../features/pending/ProjectEnvironmentTable";
import { PendingControlModal } from "../../../features/pending/PendingControlModal";
import { fetchPendingByContract } from "../../../services/pending";
import type { PendingProject } from "../../../types/pending";
import { useToast } from "../../../context/ToastContext";
import "./index.css";

export function PendenciasPage() {
  const toast = useToast();
  const [projects, setProjects] = useState<PendingProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<PendingProject | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [inputContrato, setInputContrato] = useState("");
  const [searched, setSearched] = useState(false);

  async function commitSearch(value: string) {
    const contrato = value.trim();
    if (!contrato) return;
    setLoading(true);
    setSearched(true);
    try {
      const result = await fetchPendingByContract(contrato);
      setProjects(result);
    } catch {
      toast.error("Erro ao buscar contrato.");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(project: PendingProject) {
    setSelected(project);
    setModalOpen(true);
  }

  function handleSave(updated: PendingProject) {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setModalOpen(false);
    toast.success("Pendência atualizada com sucesso.");
  }

  function handleItemsChanged(projectId: number, delta: number) {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, total: p.total + delta } : p,
      ),
    );
  }

  const summaryProjetos   = projects.length;
  const summaryTotalItens = projects.reduce((acc, p) => acc + p.total,     0);
  const summaryAtrasados  = projects.reduce((acc, p) => acc + p.atrasados, 0);
  const summaryRecebidos  = projects.reduce((acc, p) => acc + p.recebidos, 0);

  return (
    <AppLayout pageTitle="Pendências">
      <div className="pend-page">
        <div className="pend-page__top">
          <div>
            <h1 className="pend-page__title">Controle de Pendências</h1>
            <p className="pend-page__subtitle">
              {!searched
                ? "Busque um contrato para exibir os resultados"
                : loading
                  ? "Buscando..."
                  : `${summaryProjetos} projeto${summaryProjetos !== 1 ? "s" : ""} encontrado${summaryProjetos !== 1 ? "s" : ""}`}
            </p>
          </div>
          <label className="pend-filter-label">
            <span>Buscar contrato</span>
            <input
              type="text"
              className="pend-filter-input"
              placeholder="Ex: 12345"
              value={inputContrato}
              onChange={(e) => setInputContrato(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && commitSearch(inputContrato)
              }
            />
          </label>
        </div>

        <div className="pend-summary">
          <SummaryCard
            label="Projetos"
            value={summaryProjetos}
            accent="var(--text-h)"
            icon={<FolderOpen size={13} />}
            loading={loading}
          />
          <SummaryCard
            label="Total de Itens"
            value={summaryTotalItens}
            accent="var(--iniciado)"
            icon={<Layers size={13} />}
            loading={loading}
          />
          <SummaryCard
            label="Atrasados"
            value={summaryAtrasados}
            accent="var(--atrasado)"
            icon={<AlertTriangle size={13} />}
            loading={loading}
          />
          <SummaryCard
            label="Recebidos"
            value={summaryRecebidos}
            accent="var(--entregue)"
            icon={<PackageCheck size={13} />}
            loading={loading}
          />
        </div>

        <ProjectEnvironmentTable
          projects={projects}
          onSelect={handleSelect}
          loading={loading}
        />
      </div>

      <PendingControlModal
        isOpen={modalOpen}
        project={selected}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onItemsChanged={handleItemsChanged}
      />
    </AppLayout>
  );
}
