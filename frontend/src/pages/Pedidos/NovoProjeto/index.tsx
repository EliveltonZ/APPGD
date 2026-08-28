import { useState, useEffect } from "react";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { useApiData } from "../../../hooks/useApiData";
import { useToast } from "../../../context/ToastContext";
import { useAuth } from "../../../context/AuthContext";
import { ClipboardList, Wrench, Save, X, Search } from "lucide-react";
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
  AssistenciaSection,
  ClientModal,
  ContractSelectModal,
  validate,
} from "../../../features/pedidos/novo";
import { FormSection } from "../../../components/FormSection";
import { Input } from "../../../components/Input";
import {
  emptyProjectForm,
  type ProjectFormData,
  type ProjectFormErrors,
  type Client,
} from "../../../types/project";
import { fetchContractOptions, saveProject, fetchProximoOcAssistencia, type ContractOption } from "../../../services/project";
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

type TipoProjeto = 'PROJETO' | 'ASSISTENCIA';

export function NovoProjetoPage() {
  const navigate = useNavigate();
  const toast    = useToast();
  const { user } = useAuth();

  const hasProjeto     = user?.permissions.pedidos_novo     ?? false;
  const hasAssistencia = user?.permissions.assistencias_nova ?? false;
  const needsPicker    = hasProjeto && hasAssistencia;

  const { data: optionsLiberador    = [] } = useApiData(fetchLiberadores);
  const { data: optionsVendedor     = [] } = useApiData(fetchVendedores);
  const { data: optionsLoja         = [] } = useApiData(fetchLojas);
  const { data: optionsEtapa        = [] } = useApiData(fetchEtapas);
  const { data: optionsTipoContrato = [] } = useApiData(fetchTiposContrato);
  const { data: optionsTipoAmbiente = [] } = useApiData(fetchTiposAmbiente);
  const { data: optionsTipoCliente  = [] } = useApiData(fetchTiposCliente);

  const [tipoProjeto, setTipoProjeto] = useState<TipoProjeto | null>(() =>
    needsPicker ? null : hasAssistencia ? 'ASSISTENCIA' : 'PROJETO'
  );

  const [form, setForm] = useState<ProjectFormData>(emptyProjectForm);
  const [loadingOc, setLoadingOc] = useState(false);
  const [errors, setErrors] = useState<ProjectFormErrors>({});
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loadingContract, setLoadingContract] = useState(false);
  const [contractOptions, setContractOptions] = useState<ContractOption[]>([]);
  const [contractModalOpen, setContractModalOpen] = useState(false);

  async function gerarOcAssistencia(): Promise<number | null> {
    setLoadingOc(true);
    try {
      return await fetchProximoOcAssistencia();
    } catch {
      toast.error('Erro ao gerar número da assistência.');
      return null;
    } finally {
      setLoadingOc(false);
    }
  }

  async function handlePickType(tipo: TipoProjeto) {
    if (tipo === 'ASSISTENCIA') {
      const oc = await gerarOcAssistencia();
      if (oc === null) return;
      setTipoProjeto('ASSISTENCIA');
      setForm((prev) => ({ ...prev, tipoProjeto: 'ASSISTENCIA', numOC: String(oc), responsavel: user?.nome ?? '', idResponsavel: user?.id ? Number(user.id) : null }));
    } else {
      setTipoProjeto('PROJETO');
      setForm((prev) => ({ ...prev, tipoProjeto: 'PROJETO', responsavel: user?.nome ?? '', idResponsavel: user?.id ? Number(user.id) : null }));
    }
  }

  // Inicializa responsavel com o usuário logado ao montar (para usuários sem picker)
  useEffect(() => {
    if (tipoProjeto === 'ASSISTENCIA' && !form.numOC) {
      gerarOcAssistencia().then((oc) => {
        if (oc !== null) setForm((prev) => ({ ...prev, numOC: String(oc), responsavel: user?.nome ?? '', idResponsavel: user?.id ? Number(user.id) : null }));
      });
    } else if (tipoProjeto === 'PROJETO') {
      setForm((prev) => ({ ...prev, responsavel: user?.nome ?? '', idResponsavel: user?.id ? Number(user.id) : null }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(field: keyof ProjectFormData, value: string | boolean | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
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
    const upperForm = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, typeof v === "string" ? v.toUpperCase() : v]),
    ) as typeof form;
    try {
      await saveProject(upperForm);
      toast.success(tipoProjeto === 'ASSISTENCIA' ? "Assistência salva com sucesso." : "Projeto salvo com sucesso.");
      setForm({ ...emptyProjectForm(), tipoProjeto: tipoProjeto! });
      setErrors({});
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  const isAssistencia = tipoProjeto === 'ASSISTENCIA';
  const pageTitle     = isAssistencia ? 'Nova Assistência' : 'Novo Projeto';
  const pageSubtitle  = isAssistencia
    ? 'Assistência técnica vinculada a um projeto existente'
    : 'Preencha os campos para cadastrar uma nova ordem';
  const saveLabel     = isAssistencia ? 'Salvar Assistência' : 'Salvar Projeto';
  const confirmMsg    = isAssistencia
    ? 'Confirmar cadastro da nova assistência?'
    : 'Confirmar cadastro do novo projeto?';

  // Picker — exibido apenas para quem tem as duas permissões e ainda não escolheu
  if (tipoProjeto === null) {
    return (
      <AppLayout pageTitle="Novo Pedido">
        <div className="projeto-page">
          <div className="projeto-tipo-picker">
            <p className="projeto-tipo-picker__label">Selecione o tipo de lançamento</p>
            <div className="projeto-tipo-picker__cards">
              <button
                className="projeto-tipo-picker__card"
                onClick={() => handlePickType('PROJETO')}
                type="button"
              >
                <ClipboardList size={40} className="projeto-tipo-picker__card-icon" />
                <span className="projeto-tipo-picker__card-title">Projeto</span>
                <span className="projeto-tipo-picker__card-desc">Novo projeto de móveis planejados</span>
              </button>
              <button
                className="projeto-tipo-picker__card"
                onClick={() => handlePickType('ASSISTENCIA')}
                type="button"
              >
                <Wrench size={40} className="projeto-tipo-picker__card-icon" />
                <span className="projeto-tipo-picker__card-title">Assistência</span>
                <span className="projeto-tipo-picker__card-desc">Assistência técnica de projeto existente</span>
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle={pageTitle}>
      <div className="projeto-page">
        <div className="projeto-page__top">
          <div>
            <h1 className="projeto-page__title">{pageTitle}</h1>
            <p className="projeto-page__subtitle">
              {pageSubtitle}
              {needsPicker && (
                <button
                  className="projeto-tipo-picker__back-link"
                  onClick={() => setTipoProjeto(null)}
                  type="button"
                >
                  Alterar tipo
                </button>
              )}
            </p>
          </div>
          <div className="projeto-page__top-actions">
            <Button
              variant="primary"
              size="sm"
              loading={saving}
              onClick={handleSave}
            >
              <Save size={14} />
              {saveLabel}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <X size={14} />
              Cancelar
            </Button>
          </div>
        </div>

        <div className="projeto-page__form" onKeyDown={handleFormKeyDown}>
          {isAssistencia ? (
            <>
              <FormSection step={1} title="Identificação da Assistência">
                <div className="frow frow--3">
                  <Input label="Nº OC" value={form.numOC} readOnly />
                  <div className="ffield-with-action">
                    <Input
                      label="Cliente *"
                      value={form.clienteNome}
                      readOnly
                      placeholder="Selecione um cliente..."
                      error={errors.clienteNome}
                    />
                    <Button type="button" variant="secondary" size="md" onClick={() => setClientModalOpen(true)}>
                      <Search size={14} />
                    </Button>
                  </div>
                  <Input
                    label="Ambiente *"
                    value={form.ambiente}
                    onChange={(e) => handleChange("ambiente", e.target.value)}
                    error={errors.ambiente}
                    placeholder="Ex: Cozinha, Dormitório..."
                  />
                </div>
              </FormSection>
              <AssistenciaSection
                form={form}
                onChange={handleChange}
                errors={errors}
              />
            </>
          ) : (
            <>
              <IdentificationSection
                mode="novo"
                form={form}
                onChange={handleChange}
                errors={errors}
                onContractBlur={handleContractBlur}
                onNumOCDoubleClick={handleNumOCDoubleClick}
                loadingContract={loadingContract || loadingOc}
                numOCReadOnly={false}
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
            </>
          )}
        </div>

        <div className="projeto-page__bottom">
          <Button variant="primary" loading={saving} onClick={handleSave}>
            <Save size={14} />
            {saveLabel}
          </Button>
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <X size={14} />
            Cancelar
          </Button>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        message={confirmMsg}
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
