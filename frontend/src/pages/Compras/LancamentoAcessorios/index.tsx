import { useState } from "react";
import { FolderOpen, Layers, AlertTriangle, PackageCheck } from "lucide-react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { SummaryCard } from "../../../components/SummaryCard";
import { ProjectEnvironmentTable } from "../../../features/accessoryLaunch/ProjectEnvironmentTable";
import { AccessoryLaunchModal } from "../../../features/accessoryLaunch/AccessoryLaunchModal";
import { fetchAccessoryLaunchProjectsByContract } from "../../../services/accessoryLaunch";
import type { AccessoryLaunchProject } from "../../../types/accessoryLaunch";
import { useToast } from "../../../context/ToastContext";
import "./index.css";

// Tela antiga de lançamento de acessórios de compra (tblAcessorios), mantida
// em paralelo ao fluxo novo "Itens Pedido" (tblXmlConsumo) — este último não
// tem nome de permissão em comum com esta tela de propósito, pra nunca
// colidir com a rota /compras/itens-pedido. Ver memória "Limpeza futura do
// modelo antigo" — remover quando o modelo novo cobrir compra/previsão/
// recebimento e a decisão de descontinuar o antigo for tomada.
export function LancamentoAcessoriosPage() {
  const toast = useToast();
  const [projects, setProjects] = useState<AccessoryLaunchProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<AccessoryLaunchProject | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [inputContrato, setInputContrato] = useState("");
  const [searched, setSearched] = useState(false);

  async function commitSearch(value: string) {
    const contrato = value.trim();
    if (!contrato) return;
    setLoading(true);
    setSearched(true);
    try {
      const result = await fetchAccessoryLaunchProjectsByContract(contrato);
      setProjects(result);
    } catch {
      toast.error("Erro ao buscar contrato.");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(project: AccessoryLaunchProject) {
    setSelected(project);
    setModalOpen(true);
  }

  function handleItemsChanged(projectId: number, delta: number) {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, total: p.total + delta } : p,
      ),
    );
  }

  const summaryProjetos   = projects.length;
  const summaryTotalItens = projects.reduce((acc, p) => acc + p.total, 0);
  const summaryAtrasados  = projects.reduce((acc, p) => acc + p.atrasados, 0);
  const summaryRecebidos  = projects.reduce((acc, p) => acc + p.recebidos, 0);

  return (
    <AppLayout pageTitle="Lançamento de Acessórios">
      <div className="acc-page">
        <div className="acc-page__top">
          <div>
            <h1 className="acc-page__title">Lançamento de Acessórios (Compras)</h1>
            {!loading && (
              <p className="acc-page__subtitle">
                {!searched
                  ? "Busque um contrato para exibir os resultados"
                  : `${summaryProjetos} projeto${summaryProjetos !== 1 ? "s" : ""} encontrado${summaryProjetos !== 1 ? "s" : ""}`}
              </p>
            )}
          </div>
          <label className="acc-filter-label">
            <span>Buscar contrato</span>
            <input
              type="text"
              className="acc-filter-input"
              placeholder="Ex: 12345"
              value={inputContrato}
              onChange={(e) => setInputContrato(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && commitSearch(inputContrato)}
            />
          </label>
        </div>

        <div className="acc-summary">
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

      <AccessoryLaunchModal
        isOpen={modalOpen}
        project={selected}
        onClose={() => setModalOpen(false)}
        onItemsChanged={handleItemsChanged}
      />
    </AppLayout>
  );
}
