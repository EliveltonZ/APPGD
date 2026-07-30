import { useState } from "react";
import { useApiData } from "../../../hooks/useApiData";
import { useToast } from "../../../context/ToastContext";
import { Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { Button } from "../../../components/Button";
import {
  IdentificationSection,
  ClientSection,
  CommercialSection,
  EnvironmentSection,
  ScheduleSection,
  FinancialSection,
  ClientModal,
  validate,
} from "../../../features/pedidos/editar";
import { ConfirmModal } from "../../../components/ConfirmModal";
import {
  emptyProjectForm,
  type ProjectFormData,
  type ProjectFormErrors,
  type Client,
} from "../../../types/project";
import { fetchEditProject, saveEditProject } from "../../../services/project";
import {
  fetchLiberadores,
  fetchVendedores,
  fetchLojas,
  fetchEtapas,
  fetchTiposContrato,
  fetchTiposAmbiente,
  fetchTiposCliente,
} from "../../../services/utils";
import "./index.css";


export function EditaProjetoPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: optionsLiberador    = [] } = useApiData(fetchLiberadores);
  const { data: optionsVendedor     = [] } = useApiData(fetchVendedores);
  const { data: optionsLoja         = [] } = useApiData(fetchLojas);
  const { data: optionsEtapa        = [] } = useApiData(fetchEtapas);
  const { data: optionsTipoContrato = [] } = useApiData(fetchTiposContrato);
  const { data: optionsTipoAmbiente = [] } = useApiData(fetchTiposAmbiente);
  const { data: optionsTipoCliente  = [] } = useApiData(fetchTiposCliente);

  const [form, setForm] = useState<ProjectFormData>(emptyProjectForm);
  const [errors, setErrors] = useState<ProjectFormErrors>({});
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProject, setLoadingProject] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleChange(field: keyof ProjectFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleSelectClient(client: Client) {
    setForm((prev) => ({
      ...prev,
      clienteId: client.id,
      clienteNome: client.nome,
      clienteTipo: client.tipo,
    }));
    if (errors.clienteNome)
      setErrors((prev) => ({ ...prev, clienteNome: undefined }));
  }

  async function handleNumOCBlur() {
    const numOC = form.numOC.trim();
    if (!numOC) return;
    setLoadingProject(true);
    try {
      const result = await fetchEditProject(numOC);
      if (!result) { toast.error('Projeto não encontrado.'); return; }
      setForm((prev) => ({ ...prev, ...result }));
      setErrors({});
    } catch {
      toast.error('Erro ao buscar projeto.');
    } finally {
      setLoadingProject(false);
    }
  }

  function handleSave() {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    setConfirmOpen(true);
  }

  async function handleConfirmSave() {
    setConfirmOpen(false);
    setSaving(true);
    try {
      await saveEditProject(form);
      toast.success("Projeto atualizado com sucesso.");
    } catch {
      toast.error("Erro ao salvar projeto.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout pageTitle="Editar Projeto">
      <div className="novo-projeto">
        <div className="novo-projeto__top">
          <div>
            <h1 className="novo-projeto__title">Editar Projeto</h1>
            <p className="novo-projeto__subtitle">
              Preencha os campos para Editar uma ordem
            </p>
          </div>
          <div className="novo-projeto__top-actions">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <X size={14} />
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={saving}
              onClick={handleSave}
            >
              <Save size={14} />
              Salvar Projeto
            </Button>
          </div>
        </div>

        <div className="novo-projeto__form">
          <IdentificationSection
            form={form}
            onChange={handleChange}
            errors={errors}
            onNumOCBlur={handleNumOCBlur}
            loadingProject={loadingProject}
            optionsTipoContrato={optionsTipoContrato}
            optionsEtapa={optionsEtapa}
          />
          <ClientSection
            form={form}
            onChange={handleChange}
            onOpenModal={() => setClientModalOpen(true)}
            optionsTipoCliente={optionsTipoCliente}
            errors={errors}
          />
          <CommercialSection
            form={form}
            onChange={handleChange}
            errors={errors}
            optionsVendedor={optionsVendedor}
            optionsLiberador={optionsLiberador}
            optionsLoja={optionsLoja}
          />
          <EnvironmentSection
            form={form}
            onChange={handleChange}
            errors={errors}
            optionsTipoAmbiente={optionsTipoAmbiente}
          />
          <ScheduleSection
            form={form}
            onChange={handleChange}
            errors={errors}
          />
          <FinancialSection
            form={form}
            onChange={handleChange}
            errors={errors}
          />
        </div>

        <div className="novo-projeto__bottom">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <X size={14} />
            Cancelar
          </Button>
          <Button variant="primary" loading={saving} onClick={handleSave}>
            <Save size={14} />
            Salvar Projeto
          </Button>
        </div>
      </div>

      <ClientModal
        isOpen={clientModalOpen}
        onClose={() => setClientModalOpen(false)}
        onSelect={handleSelectClient}
      />

      <ConfirmModal
        isOpen={confirmOpen}
        message="Deseja salvar as alterações no projeto?"
        confirmLabel="Salvar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmSave}
        onCancel={() => setConfirmOpen(false)}
      />
    </AppLayout>
  );
}
