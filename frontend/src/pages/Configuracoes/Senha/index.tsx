import { useState } from "react";
import { KeyRound, CheckCircle2, User } from "lucide-react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { Input } from "../../../components/Input";
import { FormSection } from "../../../components/FormSection";
import { Button } from "../../../components/Button";
import { useAuth } from "../../../context/AuthContext";
import { checkPassword, updateSenha } from "../../../services/usuarios";
import { useToast } from "../../../context/ToastContext";
import "./index.css";

interface SenhaForm {
  senhaAtual: string;
  novaSenha: string;
  confirmarSenha: string;
}

type FormErrors = Partial<Record<keyof SenhaForm, string>>;

const emptyForm = (): SenhaForm => ({
  senhaAtual: "",
  novaSenha: "",
  confirmarSenha: "",
});

export function ConfigSenhaPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState<SenhaForm>(emptyForm());
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleChange(field: keyof SenhaForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (success) setSuccess(false);
  }

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.senhaAtual) e.senhaAtual = "Informe a senha atual.";
    if (!form.novaSenha) e.novaSenha = "A nova senha é obrigatória.";
    else if (form.novaSenha.length < 6)
      e.novaSenha = "A nova senha deve ter ao menos 6 caracteres.";
    else if (form.novaSenha === form.senhaAtual)
      e.novaSenha = "A nova senha deve ser diferente da atual.";
    if (!form.confirmarSenha) e.confirmarSenha = "Confirme a nova senha.";
    else if (form.novaSenha && form.confirmarSenha !== form.novaSenha)
      e.confirmarSenha = "As senhas não coincidem.";
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    if (!user) return;
    setSaving(true);
    try {
      const valid = await checkPassword(Number(user.id), form.senhaAtual);
      if (!valid) {
        setErrors({ senhaAtual: 'Senha atual incorreta.' });
        return;
      }
      await updateSenha(Number(user.id), form.novaSenha);
      setForm(emptyForm());
      setErrors({});
      setSuccess(true);
      toast.success('Senha alterada com sucesso!');
    } catch {
      toast.error('Erro ao alterar senha.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout pageTitle="Alterar Senha">
      <div className="cs-page">
        <div className="cs-page__top">
          <KeyRound size={18} className="cs-page__icon" />
          <div>
            <h1 className="cs-page__title">Alterar Senha</h1>
            <p className="cs-page__subtitle">
              Somente a sua própria senha pode ser alterada nesta tela.
            </p>
          </div>
        </div>

        <div className="container-config">
          <div className="cs-form-wrap">
            {/* Current user info */}

            <div className="cs-user-card">
              <div className="cs-user-card__avatar">
                <User size={16} />
              </div>
              <div className="cs-user-card__info">
                <span className="cs-user-card__name">{user?.nome ?? "—"}</span>
                <span className="cs-user-card__role">{user?.role ?? "—"}</span>
              </div>
            </div>

            {/* Success feedback */}
            {success && (
              <div className="cs-success">
                <CheckCircle2 size={16} />
                Senha alterada com sucesso.
              </div>
            )}

            {/* Form */}
            <FormSection step={1} title="Senha Atual">
              <Input
                label="Senha atual"
                type="password"
                placeholder="Digite sua senha atual"
                value={form.senhaAtual}
                onChange={(e) => handleChange("senhaAtual", e.target.value)}
                error={errors.senhaAtual}
                autoFocus
              />
            </FormSection>

            <FormSection step={2} title="Nova Senha">
              <Input
                label="Nova senha"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={form.novaSenha}
                onChange={(e) => handleChange("novaSenha", e.target.value)}
                error={errors.novaSenha}
              />
              <Input
                label="Confirmar nova senha"
                type="password"
                placeholder="Repita a nova senha"
                value={form.confirmarSenha}
                onChange={(e) => handleChange("confirmarSenha", e.target.value)}
                error={errors.confirmarSenha}
              />
            </FormSection>

            <div className="cs-footer">
              <Button
                variant="primary"
                size="md"
                onClick={handleSubmit}
                disabled={saving}
                type="button"
              >
                <KeyRound size={14} />
                {saving ? 'Alterando...' : 'Alterar senha'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
