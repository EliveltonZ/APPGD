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
import "../../../features/pedidos/common/projeto-page.css";

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
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir projeto.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AppLayout pageTitle="Excluir Projeto">
      <div className="projeto-page">
        <div className="projeto-page__top">
          <div>
            <h1 className="projeto-page__title">Excluir Projeto</h1>
            <p className="projeto-page__subtitle">
              Informe o Num. OC para carregar o projeto e confirmar a exclusão
            </p>
          </div>
          <div className="projeto-page__top-actions">
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
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <X size={14} />
              Cancelar
            </Button>
          </div>
        </div>

        <div className="projeto-page__form">
          <IdentificationSection
            mode="excluir"
            form={form}
            onChange={handleChange}
            onNumOCBlur={handleNumOCBlur}
            loadingProject={loadingProject}
          />
          <div className={`projeto-page__preview${loaded ? "" : " projeto-page__preview--empty"}`}>
            <ClientSection form={form} onChange={handleChange} onOpenModal={() => {}} readOnly />
            <CommercialSection form={form} onChange={handleChange} readOnly />
            <EnvironmentSection form={form} onChange={handleChange} readOnly />
            <ScheduleSection form={form} onChange={handleChange} readOnly />
            <FinancialSection form={form} onChange={handleChange} readOnly />
          </div>
        </div>

        <div className="projeto-page__bottom">
          <Button
            variant="danger"
            loading={deleting}
            disabled={!loaded}
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 size={14} />
            Excluir Projeto
          </Button>
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <X size={14} />
            Cancelar
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
