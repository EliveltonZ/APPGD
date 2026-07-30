import { useState } from "react";
import { useToast } from "../../../context/ToastContext";
import { Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { Button } from "../../../components/Button";
import { ConfirmModal } from "../../../components/ConfirmModal";
import {
  IdentificationSection,
  ClientSection,
  CommercialSection,
  EnvironmentSection,
  ScheduleSection,
  FinancialSection,
} from "../../../features/pedidos/excluir";
import {
  emptyProjectForm,
  type ProjectFormData,
} from "../../../types/project";
import { fetchDeleteProject, deleteProject } from "../../../services/project";
import "./index.css";

export function ExcluirProjetoPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState<ProjectFormData>(emptyProjectForm);
  const [loaded, setLoaded] = useState(false);
  const [loadingProject, setLoadingProject] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleChange(field: keyof ProjectFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleNumOCBlur() {
    const numOC = form.numOC.trim();
    if (!numOC) return;
    setLoadingProject(true);
    setLoaded(false);
    try {
      const result = await fetchDeleteProject(numOC);
      if (!result) { toast.error("Projeto não encontrado."); return; }
      setForm((prev) => ({ ...prev, ...result }));
      setLoaded(true);
    } catch {
      toast.error("Erro ao buscar projeto.");
    } finally {
      setLoadingProject(false);
    }
  }

  async function handleConfirmDelete() {
    setConfirmOpen(false);
    setDeleting(true);
    try {
      await deleteProject(form.numOC);
      toast.success("Projeto excluído com sucesso.");
      setForm(emptyProjectForm());
      setLoaded(false);
    } catch {
      toast.error("Erro ao excluir projeto.");
    } finally {
      setDeleting(false);
    }
  }

  const noop = () => {};

  return (
    <AppLayout pageTitle="Excluir Projeto">
      <div className="excluir-projeto">
        <div className="excluir-projeto__top">
          <div>
            <h1 className="excluir-projeto__title">Excluir Projeto</h1>
            <p className="excluir-projeto__subtitle">
              Informe o Num. OC para carregar o projeto e confirmar a exclusão
            </p>
          </div>
          <div className="excluir-projeto__top-actions">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <X size={14} />
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={deleting}
              disabled={!loaded}
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 size={14} />
              Excluir Projeto
            </Button>
          </div>
        </div>

        <div className="excluir-projeto__form">
          <IdentificationSection
            form={form}
            onChange={handleChange}
            onNumOCBlur={handleNumOCBlur}
            loadingProject={loadingProject}
          />
          <div className={`excluir-projeto__preview${loaded ? "" : " excluir-projeto__preview--empty"}`}>
            <ClientSection form={form} onChange={noop} onOpenModal={noop} errors={{}} />
            <CommercialSection form={form} />
            <EnvironmentSection form={form} />
            <ScheduleSection form={form} onChange={noop} />
            <FinancialSection form={form} onChange={noop} />
          </div>
        </div>

        <div className="excluir-projeto__bottom">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <X size={14} />
            Cancelar
          </Button>
          <Button
            variant="danger"
            loading={deleting}
            disabled={!loaded}
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 size={14} />
            Excluir Projeto
          </Button>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        message={`Deseja excluir permanentemente o projeto OC ${form.numOC}? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </AppLayout>
  );
}
