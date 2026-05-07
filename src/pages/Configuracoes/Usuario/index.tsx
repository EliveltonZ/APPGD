import { useState } from "react";
import { UserPlus, Edit2, Trash2, Users } from "lucide-react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { Modal } from "../../../components/Modal";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { Input } from "../../../components/Input";
import { FormSection } from "../../../components/FormSection";
import { Button } from "../../../components/Button";
import { mockAuthUsers } from "../../../data/authMocks";
import { emptyPermissions } from "../../../types/auth";
import { useAuth } from "../../../context/AuthContext";
import type { AuthUser } from "../../../types/auth";
import "./index.css";
import { useToast } from "../../../context/ToastContext";

interface UserForm {
  nome: string;
  role: string;
  senha: string;
  confirmSenha: string;
}

type FormErrors = Partial<Record<keyof UserForm, string>>;

const emptyForm = (): UserForm => ({
  nome: "",
  role: "",
  senha: "",
  confirmSenha: "",
});

function nextId(): string {
  const max = mockAuthUsers.reduce((m, u) => {
    const n = parseInt(u.id, 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 0);
  return String(max + 1).padStart(3, "0");
}

export function ConfigUsuarioPage() {
  const { user: currentUser, login } = useAuth();
  const [users, setUsers] = useState<AuthUser[]>(() => [...mockAuthUsers]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AuthUser | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<UserForm>(emptyForm());
  const [errors, setErrors] = useState<FormErrors>({});
  const toast = useToast();

  const isEdit = editingUser !== null;

  function openCreate() {
    setEditingUser(null);
    setForm(emptyForm());
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(user: AuthUser) {
    setEditingUser(user);
    setForm({ nome: user.nome, role: user.role, senha: "", confirmSenha: "" });
    setErrors({});
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingUser(null);
    setForm(emptyForm());
    setErrors({});
  }

  function handleChange(field: keyof UserForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.nome.trim()) e.nome = "Nome é obrigatório.";
    else if (form.nome.trim().length < 3)
      e.nome = "Nome deve ter ao menos 3 caracteres.";
    if (!form.role.trim()) e.role = "Cargo / função é obrigatório.";
    if (!isEdit) {
      if (!form.senha) e.senha = "Senha é obrigatória.";
      else if (form.senha.length < 6)
        e.senha = "Senha deve ter ao menos 6 caracteres.";
      if (!form.confirmSenha)
        e.confirmSenha = "Confirmação de senha é obrigatória.";
    }
    if (form.senha && form.senha.length > 0 && form.senha.length < 6)
      e.senha = "Senha deve ter ao menos 6 caracteres.";
    if (form.senha && form.senha !== form.confirmSenha)
      e.confirmSenha = "As senhas não coincidem.";
    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    if (isEdit && editingUser) {
      const updated: AuthUser = {
        ...editingUser,
        nome: form.nome.trim(),
        role: form.role.trim(),
      };
      const idx = mockAuthUsers.findIndex((u) => u.id === editingUser.id);
      if (idx !== -1) mockAuthUsers[idx] = updated;
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? updated : u)),
      );
      if (currentUser?.id === editingUser.id) login(updated);
      closeModal();
    } else {
      setIsOpen(true);
    }
  }

  function handleInsert() {
    const newUser: AuthUser = {
      id: nextId(),
      nome: form.nome.trim(),
      role: form.role.trim(),
      permissions: emptyPermissions(),
    };
    mockAuthUsers.push(newUser);
    setUsers((prev) => [...prev, newUser]);
    setIsOpen(false);
    closeModal();
    toast.success(`Usuario ${newUser.nome} inserido com sucesso !!`);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    const idx = mockAuthUsers.findIndex((u) => u.id === deleteTarget.id);
    if (idx !== -1) mockAuthUsers.splice(idx, 1);
    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    setDeleteTarget(null);
    toast.success(`Usuario ${deleteTarget.nome} removido com sucesso !!`);
  }

  return (
    <AppLayout pageTitle="Usuários">
      <div className="cu-page">
        {/* ── Header ──────────────────────────────────── */}
        <div className="cu-page__top">
          <div className="cu-page__heading">
            <Users size={18} className="cu-page__icon" />
            <div>
              <h1 className="cu-page__title">Usuários</h1>
              <p className="cu-page__subtitle">
                Cadastro e gerenciamento de usuários do sistema
              </p>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={openCreate}>
            <UserPlus size={14} />
            Novo Usuário
          </Button>
        </div>

        {/* ── User table ──────────────────────────────── */}
        <div className="cu-card">
          <div className="cu-card__header">
            <span className="cu-card__label">Usuários cadastrados</span>
            <span className="cu-card__count">{users.length}</span>
          </div>
          <div className="container-table">
            <table className="cu-table">
              <thead>
                <tr>
                  <th className="cu-th">ID</th>
                  <th className="cu-th">Nome</th>
                  <th className="cu-th">Cargo / Função</th>
                  <th className="cu-th" aria-label="Ações" />
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isMe = currentUser?.id === user.id;
                  return (
                    <tr key={user.id} className="cu-row">
                      <td className="cu-td cu-td--id">{user.id}</td>
                      <td className="cu-td">
                        <span className="cu-user-name">{user.nome}</span>
                        {isMe && <span className="cu-badge-you">você</span>}
                      </td>
                      <td className="cu-td cu-td--role">{user.role}</td>
                      <td className="cu-td cu-td--actions">
                        <button
                          className="cu-action-btn cu-action-btn--edit"
                          onClick={() => openEdit(user)}
                          title="Editar usuário"
                        >
                          <Edit2 size={13} />
                          Editar
                        </button>
                        <button
                          className="cu-action-btn cu-action-btn--delete"
                          onClick={() => setDeleteTarget(user)}
                          disabled={isMe}
                          title={
                            isMe
                              ? "Não é possível excluir o próprio usuário"
                              : "Excluir usuário"
                          }
                          aria-label="Excluir"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Create / Edit modal ──────────────────────── */}
      <Modal
        title={isEdit ? `Editar — ${editingUser?.nome}` : "Novo Usuário"}
        isOpen={modalOpen}
        onClose={closeModal}
        maxWidth={520}
      >
        <div className="cu-form">
          <FormSection step={1} title="Dados do Usuário">
            <Input
              label="Nome completo"
              placeholder="Ex: João da Silva"
              value={form.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              error={errors.nome}
              autoFocus
            />
            <Input
              label="Cargo / Função"
              placeholder="Ex: Analista PCP, Supervisor"
              value={form.role}
              onChange={(e) => handleChange("role", e.target.value)}
              error={errors.role}
            />
          </FormSection>

          <FormSection
            step={2}
            title={isEdit ? "Alterar Senha" : "Senha de Acesso"}
          >
            {isEdit && (
              <p className="cu-form__hint">
                Deixe os campos em branco para manter a senha atual.
              </p>
            )}
            <div className="frow frow--2">
              <Input
                label={isEdit ? "Nova Senha" : "Senha"}
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
            <Button
              variant="ghost"
              size="sm"
              onClick={closeModal}
              type="button"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              type="button"
            >
              {isEdit ? "Salvar alterações" : "Cadastrar usuário"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Confirm delete ───────────────────────────── */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        message={`Excluir o usuário "${deleteTarget?.nome}"? Esta ação não poderá ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ── Confirm insertion ───────────────────────────── */}
      <ConfirmModal
        isOpen={isOpen}
        message="Deseja inserir novo usuario ?"
        confirmLabel="Inserir"
        onConfirm={handleInsert}
        onCancel={() => setIsOpen(false)}
      />
    </AppLayout>
  );
}
