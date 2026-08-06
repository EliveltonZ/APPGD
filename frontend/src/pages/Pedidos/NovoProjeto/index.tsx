import { useState } from "react";
import { ConfirmModal } from "../../../components/ConfirmModal";
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
  ContractSelectModal,
  validate,
} from "../../../features/pedidos/novo";
import {
  emptyProjectForm,
  type ProjectFormData,
  type ProjectFormErrors,
  type Client,
} from "../../../types/project";
import { fetchContractOptions, saveProject, type ContractOption } from "../../../services/project";
import { fetchMaxOrder } from "../../../services/pcp";
import {
  fetchLiberadores,
  fetchVendedores,
  fetchLojas,
  fetchEtapas,
  fetchTiposContrato,
  fetchTiposAmbiente,
  fetchTiposCliente,
} from "../../../services/utils";
import "../../../features/pedidos/common/projeto-page.css";


export function NovoProjetoPage() {
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loadingContract, setLoadingContract] = useState(false);
  const [contractOptions, setContractOptions] = useState<ContractOption[]>([]);
  const [contractModalOpen, setContractModalOpen] = useState(false);

  function handleChange(field: keyof ProjectFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value.toUpperCase() }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleFormKeyDown(e: React.KeyboardEvent) {
    if (e.key !== 'Enter') return;
    const target = e.target as HTMLElement;
    if (target.tagName === 'TEXTAREA') return;
    e.preventDefault();
    const selector = 'input:not([disabled]), select:not([disabled]), button:not([disabled])';
    const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
    const index = elements.indexOf(target);
    if (index > -1 && index < elements.length - 1) elements[index + 1].focus();
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

  async function handleNumOCDoubleClick() {
    try {
      const max = await fetchMaxOrder();
      setForm((prev) => ({ ...prev, numOC: String(max + 1) }));
      if (errors.numOC) setErrors((prev) => ({ ...prev, numOC: undefined }));
    } catch {
      toast.error("Erro ao buscar próximo N° OC.");
    }
  }

  async function handleContractBlur() {
    const contrato = form.contrato.trim();
    if (!contrato) return;
    setLoadingContract(true);
    try {
      const results = await fetchContractOptions(contrato);
      if (!results.length) { toast.error('Contrato não encontrado.'); return; }

      const seen = new Set<string | number>();
      const distinct = results.filter((r) => {
        const key = r.loja ?? '';
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      if (distinct.length === 1) {
        setForm((prev) => ({ ...prev, ...distinct[0] }));
        setErrors({});
      } else {
        setContractOptions(distinct);
        setContractModalOpen(true);
      }
    } catch {
      toast.error('Erro ao buscar contrato.');
    } finally {
      setLoadingContract(false);
    }
  }

  function handleContractSelect(option: ContractOption) {
    setForm((prev) => ({ ...prev, ...option }));
    setErrors({});
    setContractModalOpen(false);
  }

  function handleSave() {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error("Preencha os campos obrigatórios.");
      return;
    }
    setConfirmOpen(true);
  }

  async function handleConfirm() {
    setConfirmOpen(false);
    setSaving(true);
    try {
      await saveProject(form);
      toast.success("Projeto salvo com sucesso.");
      setForm(emptyProjectForm());
      setErrors({});
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar projeto.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout pageTitle="Novo Projeto">
      <div className="projeto-page">
        <div className="projeto-page__top">
          <div>
            <h1 className="projeto-page__title">Novo Projeto</h1>
            <p className="projeto-page__subtitle">
              Preencha os campos para cadastrar uma nova ordem
            </p>
          </div>
          <div className="projeto-page__top-actions">
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

        <div className="projeto-page__form" onKeyDown={handleFormKeyDown}>
          <IdentificationSection
            mode="novo"
            form={form}
            onChange={handleChange}
            errors={errors}
            onContractBlur={handleContractBlur}
            onNumOCDoubleClick={handleNumOCDoubleClick}
            loadingContract={loadingContract}
            optionsTipoContrato={optionsTipoContrato}
            optionsEtapa={optionsEtapa}
          />
          <ClientSection
            form={form}
            onChange={handleChange}
            onOpenModal={() => setClientModalOpen(true)}
            errors={errors}
            optionsTipoCliente={optionsTipoCliente}
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

        <div className="projeto-page__bottom">
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

      <ConfirmModal
        isOpen={confirmOpen}
        message="Confirmar cadastro do novo projeto?"
        confirmLabel="Salvar"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />

      <ClientModal
        isOpen={clientModalOpen}
        onClose={() => setClientModalOpen(false)}
        onSelect={handleSelectClient}
      />

      <ContractSelectModal
        isOpen={contractModalOpen}
        options={contractOptions}
        lojas={optionsLoja}
        contrato={form.contrato}
        onSelect={handleContractSelect}
        onClose={() => setContractModalOpen(false)}
      />
    </AppLayout>
  );
}
