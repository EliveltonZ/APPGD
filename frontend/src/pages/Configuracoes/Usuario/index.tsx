import { useState, useEffect } from "react";
import { UserPlus, Users } from "lucide-react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { Modal } from "../../../components/Modal";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { Input } from "../../../components/Input";
import { FormSection } from "../../../components/FormSection";
import { Button } from "../../../components/Button";
import { fetchMaxUserId, insertUser } from "../../../services/usuarios";
import { useToast } from "../../../context/ToastContext";
import "./index.css";

interface UserForm {
  id:          string;
  login:       string;
  senha:       string;
  confirmSenha: string;
  setor:       string;
  camiseta:    string;
  calca:       string;
  sapato:      string;
  local:       string;
}

type FormErrors = Partial<Record<keyof UserForm, string>>;

const emptyForm = (): UserForm => ({
  id:          "",
  login:       "",
  senha:       "",
  confirmSenha: "",
  setor:       "",
  camiseta:    "",
  calca:       "",
  sapato:      "",
  local:       "",
});

export function ConfigUsuarioPage() {
  const toast = useToast();
  const [modalOpen, setModalOpen]       = useState(false);
  const [confirmOpen, setConfirmOpen]   = useState(false);
  const [saving, setSaving]             = useState(false);
  const [form, setForm]                 = useState<UserForm>(emptyForm());
  const [errors, setErrors]             = useState<FormErrors>({});

  useEffect(() => {
    if (!modalOpen) return;
    fetchMaxUserId()
      .then((id) => setForm((prev) => ({ ...prev, id: String(id) })))
      .catch(() => {});
  }, [modalOpen]);

  function openCreate() {
    setForm(emptyForm());
    setErrors({});
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setForm(emptyForm());
    setErrors({});
  }

  function handleChange(field: keyof UserForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.login.trim())  e.login       = "Login é obrigatório.";
    if (!form.setor.trim())  e.setor       = "Setor é obrigatório.";
    if (!form.local.trim())  e.local       = "Local é obrigatório.";
    if (!form.senha)         e.senha       = "Senha é obrigatória.";
    else if (form.senha.length < 6) e.senha = "Mínimo 6 caracteres.";
    if (!form.confirmSenha)  e.confirmSenha = "Confirmação é obrigatória.";
    else if (form.senha !== form.confirmSenha) e.confirmSenha = "As senhas não coincidem.";
    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setConfirmOpen(true);
  }

  async function handleInsert() {
    setConfirmOpen(false);
    setSaving(true);
    try {
      await insertUser({
        p_id:       Number(form.id),
        p_login:    form.login.trim(),
        p_senha:    form.senha,
        p_setor:    form.setor.trim(),
        p_camiseta: form.camiseta.trim(),
        p_calca:    form.calca.trim(),
        p_sapato:   form.sapato.trim(),
        p_local:    form.local.trim(),
      });
      toast.success(`Usuário "${form.login}" cadastrado com sucesso!`);
      closeModal();
    } catch {
      toast.error("Erro ao cadastrar usuário.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout pageTitle="Usuários">
      <div className="cu-page">
        <div className="cu-page__top">
          <div className="cu-page__heading">
            <Users size={18} className="cu-page__icon" />
            <div>
              <h1 className="cu-page__title">Usuários</h1>
              <p className="cu-page__subtitle">Cadastro de usuários do sistema</p>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={openCreate}>
            <UserPlus size={14} />
            Novo Usuário
          </Button>
        </div>
      </div>

      <Modal
        title="Novo Usuário"
        isOpen={modalOpen}
        onClose={closeModal}
        maxWidth={560}
      >
        <div className="cu-form">
          <FormSection step={1} title="Identificação">
            <div className="frow frow--2">
              <Input
                label="ID"
                value={form.id}
                readOnly
              />
              <Input
                label="Login"
                placeholder="Ex: joao.silva"
                value={form.login}
                onChange={(e) => handleChange("login", e.target.value)}
                error={errors.login}
                autoFocus
              />
            </div>
            <div className="frow frow--2">
              <Input
                label="Setor"
                placeholder="Ex: Produção, Expedição"
                value={form.setor}
                onChange={(e) => handleChange("setor", e.target.value)}
                error={errors.setor}
              />
              <Input
                label="Local"
                placeholder="Ex: Fábrica, Escritório"
                value={form.local}
                onChange={(e) => handleChange("local", e.target.value)}
                error={errors.local}
              />
            </div>
          </FormSection>

          <FormSection step={2} title="Vestuário">
            <div className="frow frow--3">
              <Input
                label="Camiseta"
                placeholder="Ex: M, G, GG"
                value={form.camiseta}
                onChange={(e) => handleChange("camiseta", e.target.value)}
              />
              <Input
                label="Calça"
                placeholder="Ex: 42"
                value={form.calca}
                onChange={(e) => handleChange("calca", e.target.value)}
              />
              <Input
                label="Sapato"
                placeholder="Ex: 40"
                value={form.sapato}
                onChange={(e) => handleChange("sapato", e.target.value)}
              />
            </div>
          </FormSection>

          <FormSection step={3} title="Senha de Acesso">
            <div className="frow frow--2">
              <Input
                label="Senha"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={form.senha}
                onChange={(e) => handleChange("senha", e.target.value)}
                error={errors.senha}
              />
              <Input
                label="Confirmar Senha"
                type="password"
                placeholder="Repita a senha"
                value={form.confirmSenha}
                onChange={(e) => handleChange("confirmSenha", e.target.value)}
                error={errors.confirmSenha}
              />
            </div>
          </FormSection>

          <div className="cu-form__footer">
            <Button variant="ghost" size="sm" onClick={closeModal} type="button">
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleSubmit} disabled={saving} type="button">
              {saving ? "Cadastrando..." : "Cadastrar usuário"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={confirmOpen}
        message={`Deseja cadastrar o usuário "${form.login}"?`}
        confirmLabel="Cadastrar"
        onConfirm={handleInsert}
        onCancel={() => setConfirmOpen(false)}
      />
    </AppLayout>
  );
}
