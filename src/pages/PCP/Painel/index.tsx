import { useState, useMemo, useEffect } from "react";
import type { ReactNode } from "react";
import { FolderOpen, Layers, Play, Download, Factory, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SummaryCard } from "../../../components/SummaryCard";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { PcpActionCard } from "../../../features/pcp/PcpActionCard";
import { ProjectReleaseModal } from "../../../features/pcp/ProjectReleaseModal";
import { BatchGenerationModal } from "../../../features/pcp/BatchGenerationModal";
import { StartBatchModal } from "../../../features/pcp/StartBatchModal";
import { ExportProjectsModal } from "../../../features/pcp/ExportProjectsModal";
import { useApiData } from "../../../hooks/useApiData";
import { fetchProductionProjects } from "../../../services/pcp";
import { PROJECT_STATUS_LABELS } from "../../../data/pcpConfig";
import type {
  ProductionProject,
  ExportProjectsFormData,
  ProjectStatus,
} from "../../../types/pcp";
import "./index.css";

type ModalKey = "release" | "batch" | "startbatch" | "export";

interface ActionDef {
  key: ModalKey;
  icon: LucideIcon;
  title: string;
  description: (stats: StatusStats) => string;
}

interface StatusStats {
  disponivel: number;
  em_lote: number;
  em_producao: number;
  concluido: number;
}

const ACTIONS: ActionDef[] = [
  {
    key: "release",
    icon: FolderOpen,
    title: "Liberação de Projetos",
    description: () => "Consulte e libere projetos para a fila de produção.",
  },
  {
    key: "batch",
    icon: Layers,
    title: "Gerar Lote",
    description: ({ disponivel }) =>
      `Agrupe projetos disponíveis em um novo lote. ${disponivel} disponíve${disponivel !== 1 ? "is" : "l"}.`,
  },
  {
    key: "startbatch",
    icon: Play,
    title: "Iniciar Lote",
    description: ({ em_lote }) =>
      `Registre o início de produção de um lote. ${em_lote} aguardando.`,
  },
  {
    key: "export",
    icon: Download,
    title: "Exportar Projetos",
    description: () => "Exporte projetos por período para relatório.",
  },
];

const STATUS_ORDER: ProjectStatus[] = ["disponivel", "em_lote", "em_producao", "concluido"];

const STATUS_CARD_DEF: Record<ProjectStatus, { accent: string; icon: ReactNode }> = {
  disponivel:  { accent: 'var(--accent)', icon: <FolderOpen   size={13} /> },
  em_lote:     { accent: '#2080c5',       icon: <Layers       size={13} /> },
  em_producao: { accent: '#d97706',       icon: <Factory      size={13} /> },
  concluido:   { accent: '#16a34a',       icon: <CheckCircle2 size={13} /> },
};

export function PcpPage() {
  const { data: fetched, loading } = useApiData(fetchProductionProjects);
  const [openModal, setOpenModal] = useState<ModalKey | null>(null);
  const [projects, setProjects] = useState<ProductionProject[]>([]);

  useEffect(() => {
    if (fetched) setProjects(fetched);
  }, [fetched]);

  const stats = useMemo<StatusStats>(
    () => ({
      disponivel:  projects.filter((p) => p.status === "disponivel").length,
      em_lote:     projects.filter((p) => p.status === "em_lote").length,
      em_producao: projects.filter((p) => p.status === "em_producao").length,
      concluido:   projects.filter((p) => p.status === "concluido").length,
    }),
    [projects],
  );

  function handleReleaseSave(project: ProductionProject) {
    setProjects((prev) => {
      const exists = prev.find((p) => p.numOC === project.numOC);
      return exists
        ? prev.map((p) => (p.numOC === project.numOC ? project : p))
        : [...prev, project];
    });
    setOpenModal(null);
  }

  function handleBatchGenerate(lote: string, ids: number[]) {
    setProjects((prev) =>
      prev.map((p) => ids.includes(p.id) ? { ...p, lote, status: "em_lote" } : p),
    );
    setOpenModal(null);
  }

  function handleBatchStart(lote: string, _dataInicio: string) {
    setProjects((prev) =>
      prev.map((p) =>
        p.lote === lote && p.status === "em_lote" ? { ...p, status: "em_producao" } : p,
      ),
    );
    setOpenModal(null);
  }

  function handleExport(_form: ExportProjectsFormData) { setOpenModal(null); }

  return (
    <AppLayout pageTitle="PCP">
      <div className="pcp-page">
        <div className="pcp-page__header">
          <h1 className="pcp-page__title">Planejamento e Controle de Produção</h1>
          <p className="pcp-page__subtitle">
            Centro operacional do PCP — libere, agrupe, inicie e exporte projetos.
          </p>
        </div>

        <div className="container-controllers">
          <div className="pcp-pipeline">
            {STATUS_ORDER.map((status) => (
              <SummaryCard
                key={status}
                label={PROJECT_STATUS_LABELS[status]}
                value={stats[status]}
                accent={STATUS_CARD_DEF[status].accent}
                icon={STATUS_CARD_DEF[status].icon}
                loading={loading}
              />
            ))}
          </div>

          <div className="pcp-actions-grid">
            {ACTIONS.map((action) => (
              <PcpActionCard
                key={action.key}
                icon={action.icon}
                title={action.title}
                description={action.description(stats)}
                onClick={() => setOpenModal(action.key)}
              />
            ))}
          </div>
        </div>
      </div>

      <ProjectReleaseModal
        isOpen={openModal === "release"}
        projects={projects}
        onClose={() => setOpenModal(null)}
        onSave={handleReleaseSave}
      />
      <BatchGenerationModal
        isOpen={openModal === "batch"}
        projects={projects}
        onClose={() => setOpenModal(null)}
        onGenerate={handleBatchGenerate}
      />
      <StartBatchModal
        isOpen={openModal === "startbatch"}
        projects={projects}
        onClose={() => setOpenModal(null)}
        onStart={handleBatchStart}
      />
      <ExportProjectsModal
        isOpen={openModal === "export"}
        onClose={() => setOpenModal(null)}
        onExport={handleExport}
      />
    </AppLayout>
  );
}