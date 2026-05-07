import { useState } from "react";
import { useToast } from "../../../context/ToastContext";
import { Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { Button } from "../../../components/Button";
import { IdentificationSection } from "../../../features/project/sections/IdentificationSection";
import { ClientSection } from "../../../features/project/sections/ClientSection";
import { CommercialSection } from "../../../features/project/sections/CommercialSection";
import { EnvironmentSection } from "../../../features/project/sections/EnvironmentSection";
import { ScheduleSection } from "../../../features/project/sections/ScheduleSection";
import { FinancialSection } from "../../../features/project/sections/FinancialSection";
import { ClientModal } from "../../../features/project/ClientModal";
import {
  emptyProjectForm,
  type ProjectFormData,
  type ProjectFormErrors,
  type Client,
} from "../../../types/project";
import { mockContracts } from "../../../data/projectMocks";
import "./index.css";

function validate(form: ProjectFormData): ProjectFormErrors {
  const numOC = form.numOC.trim();
  const errors: ProjectFormErrors = {};
  if (!form.contrato.trim()) errors.contrato = "Obrigatório";
  if (numOC.length < 10 || isNaN(Number(numOC)))
    errors.numOC = "Ordem de compra invalida";
  if (!form.clienteNome) errors.clienteNome = "Selecione um cliente";
  if (!form.tipoContrato) errors.tipoContrato = "Selecione o tipo";
  if (!form.etapa) errors.etapa = "Selecione a etapa";
  if (!form.vendedor) errors.vendedor = "Selecione um vendedor";
  if (!form.liberador) errors.liberador = "Selecione um liberador";
  if (!form.loja) errors.loja = "Selecione uma loja";
  if (!form.tipoAmbiente) errors.tipoAmbiente = "Selecione um tipo";
  if (!form.ambiente) errors.ambiente = "Obrigatório";
  if (!form.dataAssinatura) errors.dataAssinatura = "Data Invalida";
  if (!form.chegouFabrica) errors.chegouFabrica = "Data Invalida";
  if (!form.dataEntrega) errors.dataEntrega = "Data Invalida";
  if (!form.valorBruto) errors.valorBruto = "Obrigatório";
  if (!form.valorNegociado) errors.valorNegociado = "Obrigatório";

  return errors;
}

export function NovoProjetoPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState<ProjectFormData>(emptyProjectForm);
  const [errors, setErrors] = useState<ProjectFormErrors>({});
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingContract, setLoadingContract] = useState(false);

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

  async function handleContractBlur() {
    const contrato = form.contrato.trim();
    if (!contrato) return;
    setLoadingContract(true);
    await new Promise((r) => setTimeout(r, 400));
    const result = mockContracts[contrato];
    setLoadingContract(false);
    if (!result) return;
    setForm((prev) => ({ ...prev, ...result }));
    setErrors({});
  }

  async function handleSave() {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    // TODO: replace with real API call
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast.success("Projeto salvo com sucesso.");
    console.log("Project saved:", form);
  }

  return (
    <AppLayout pageTitle="Novo Projeto">
      <div className="novo-projeto">
        <div className="novo-projeto__top">
          <div>
            <h1 className="novo-projeto__title">Novo Projeto</h1>
            <p className="novo-projeto__subtitle">
              Preencha os campos para cadastrar uma nova ordem
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
            onContractBlur={handleContractBlur}
            loadingContract={loadingContract}
          />
          <ClientSection
            form={form}
            onChange={handleChange}
            onOpenModal={() => setClientModalOpen(true)}
            errors={errors}
          />
          <CommercialSection
            form={form}
            onChange={handleChange}
            errors={errors}
          />
          <EnvironmentSection
            form={form}
            onChange={handleChange}
            errors={errors}
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
    </AppLayout>
  );
}
