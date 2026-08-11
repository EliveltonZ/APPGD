import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AppLayout } from '../../../components/Layout/AppLayout'
import { DataTable } from '../../../components/DataTable'
import type { TableColumn } from '../../../components/DataTable'
import { Modal } from '../../../components/Modal'
import { Button } from '../../../components/Button'
import { Input } from '../../../components/Input'
import { FormSection } from '../../../components/FormSection'
import { useToast } from '../../../context/ToastContext'
import { useApiData } from '../../../hooks/useApiData'
import {
  fetchAllUsers,
  updateUser,
  fetchMaxUserId,
  insertUser,
} from '../../../services/usuarios'
import type { UserRecord } from '../../../services/usuarios'
import './index.css'

// ── Tipos locais ─────────────────────────────────────────────────────────────

interface UserRow extends UserRecord {
  status_label: string
}

interface CreateForm {
  id:           string
  login:        string
  senha:        string
  confirmSenha: string
  setor:        string
  local:        string
  camiseta:     string
  calca:        string
  sapato:       string
}

type CreateErrors = Partial<Record<keyof CreateForm, string>>

const emptyCreate = (): CreateForm => ({
  id: '', login: '', senha: '', confirmSenha: '',
  setor: '', local: '', camiseta: '', calca: '', sapato: '',
})

// ── Colunas ──────────────────────────────────────────────────────────────────

const COLUMNS: TableColumn<UserRow>[] = [
  { key: 'id',           label: 'ID',     type: 'number', sortable: true,  filterable: false, minWidth: 55,  align: 'center' },
  { key: 'login',        label: 'Nome',   type: 'text',   sortable: true,  filterable: true,  minWidth: 200 },
  { key: 'setor',        label: 'Setor',  type: 'text',   sortable: true,  filterable: true,  minWidth: 140 },
  { key: 'local',        label: 'Local',  type: 'text',   sortable: true,  filterable: true,  minWidth: 120 },
  {
    key: 'status_label',
    label: 'Status',
    type: 'text',
    sortable: true,
    filterable: true,
    minWidth: 90,
    align: 'center',
    render: (_val, row) => (
      <span className={`cad-u-badge cad-u-badge--${row.ativo ? 'ativo' : 'inativo'}`}>
        {row.ativo ? 'Ativo' : 'Inativo'}
      </span>
    ),
  },
]

function toRow(u: UserRecord): UserRow {
  return { ...u, status_label: u.ativo ? 'Ativo' : 'Inativo' }
}

// ── Página ───────────────────────────────────────────────────────────────────

export function CadastrosUsuariosPage() {
  const toast = useToast()

  const { data: rawUsers = [], loading, refetch: reload } = useApiData(fetchAllUsers)
  const rows = rawUsers.map(toRow)

  // ── Modal criar ──────────────────────────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState<CreateForm>(emptyCreate())
  const [createErrors, setCreateErrors] = useState<CreateErrors>({})
  const [creating, setCreating] = useState(false)

  async function openCreate() {
    setCreateForm(emptyCreate())
    setCreateErrors({})
    setCreateOpen(true)
    const nextId = await fetchMaxUserId().catch(() => 0)
    setCreateForm((prev) => ({ ...prev, id: String(nextId) }))
  }

  function setCreate(field: keyof CreateForm, value: string) {
    setCreateForm((prev) => ({ ...prev, [field]: value }))
    setCreateErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function validateCreate(): CreateErrors {
    const e: CreateErrors = {}
    if (!createForm.login.trim())  e.login = 'Nome é obrigatório.'
    if (!createForm.setor.trim())  e.setor = 'Setor é obrigatório.'
    if (!createForm.local.trim())  e.local = 'Local é obrigatório.'
    if (!createForm.senha)         e.senha = 'Senha é obrigatória.'
    else if (createForm.senha.length < 6) e.senha = 'Mínimo 6 caracteres.'
    if (!createForm.confirmSenha)  e.confirmSenha = 'Confirmação é obrigatória.'
    else if (createForm.senha !== createForm.confirmSenha) e.confirmSenha = 'As senhas não coincidem.'
    return e
  }

  async function handleCreate() {
    const e = validateCreate()
    if (Object.keys(e).length > 0) { setCreateErrors(e); return }
    setCreating(true)
    try {
      await insertUser({
        p_id:       Number(createForm.id),
        p_login:    createForm.login.trim(),
        p_senha:    createForm.senha,
        p_setor:    createForm.setor.trim(),
        p_local:    createForm.local.trim(),
        p_camiseta: createForm.camiseta.trim(),
        p_calca:    createForm.calca.trim(),
        p_sapato:   createForm.sapato.trim(),
      })
      toast.success(`Usuário "${createForm.login}" cadastrado.`)
      setCreateOpen(false)
      reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao cadastrar usuário.')
    } finally {
      setCreating(false)
    }
  }

  // ── Modal editar ─────────────────────────────────────────────────────────
  const [editOpen, setEditOpen]     = useState(false)
  const [editUser, setEditUser]     = useState<UserRecord | null>(null)
  const [editForm, setEditForm]     = useState<Omit<UserRecord, 'id'>>({
    login: '', setor: '', local: '', camiseta: '', calca: '', sapato: '', ativo: true,
  })
  const [saving, setSaving] = useState(false)

  function openEdit(row: UserRow) {
    const { status_label: _, ...user } = row
    setEditUser(user)
    setEditForm({
      login:    user.login    ?? '',
      setor:    user.setor    ?? '',
      local:    user.local    ?? '',
      camiseta: user.camiseta ?? '',
      calca:    user.calca    ?? '',
      sapato:   user.sapato   ?? '',
      ativo:    user.ativo,
    })
    setEditOpen(true)
  }

  function setEdit<K extends keyof typeof editForm>(field: K, value: typeof editForm[K]) {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    if (!editUser) return
    if (!editForm.login.trim()) { toast.error('Nome é obrigatório.'); return }
    setSaving(true)
    try {
      await updateUser(editUser.id, { ...editForm, login: editForm.login.trim() })
      toast.success('Usuário atualizado.')
      setEditOpen(false)
      reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AppLayout pageTitle="Cadastro de Usuários">
      <div className="cad-u-page">
        <div className="cad-u-header">
          <div>
            <h2 className="cad-u-title">Usuários</h2>
            {!loading && (
              <p className="cad-u-count">
                {rows.length} {rows.length === 1 ? 'usuário' : 'usuários'} •{' '}
                {rows.filter((r) => r.ativo).length} ativos
              </p>
            )}
          </div>
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus size={14} />
            Novo
          </Button>
        </div>

        <DataTable<UserRow>
          columns={COLUMNS}
          data={rows}
          rowKey="id"
          loading={loading}
          storageKey="dt:cad:usuarios"
          showIndex
          onRowClick={openEdit}
          emptyMessage="Nenhum usuário cadastrado."
        />
      </div>

      {/* ── Modal Criar ── */}
      <Modal
        title="Novo Usuário"
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        maxWidth={560}
        footer={
          <div className="cad-u-footer">
            <Button variant="ghost" size="sm" onClick={() => setCreateOpen(false)} disabled={creating}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreate} disabled={creating}>
              {creating ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </div>
        }
      >
        <div className="cad-u-form">
          <FormSection step={1} title="Identificação">
            <div className="frow frow--2">
              <Input label="ID" value={createForm.id} readOnly />
              <Input
                label="Nome / Login"
                placeholder="Ex: João Silva"
                value={createForm.login}
                onChange={(e) => setCreate('login', e.target.value)}
                error={createErrors.login}
                autoFocus
              />
            </div>
            <div className="frow frow--2">
              <Input
                label="Setor"
                placeholder="Ex: Produção, Expedição"
                value={createForm.setor}
                onChange={(e) => setCreate('setor', e.target.value)}
                error={createErrors.setor}
              />
              <Input
                label="Local"
                placeholder="Ex: Fábrica, Escritório"
                value={createForm.local}
                onChange={(e) => setCreate('local', e.target.value)}
                error={createErrors.local}
              />
            </div>
          </FormSection>

          <FormSection step={2} title="Vestuário">
            <div className="frow frow--3">
              <Input
                label="Camiseta"
                placeholder="Ex: M, G, GG"
                value={createForm.camiseta}
                onChange={(e) => setCreate('camiseta', e.target.value)}
              />
              <Input
                label="Calça"
                placeholder="Ex: 42"
                value={createForm.calca}
                onChange={(e) => setCreate('calca', e.target.value)}
              />
              <Input
                label="Sapato"
                placeholder="Ex: 40"
                value={createForm.sapato}
                onChange={(e) => setCreate('sapato', e.target.value)}
              />
            </div>
          </FormSection>

          <FormSection step={3} title="Senha de Acesso">
            <div className="frow frow--2">
              <Input
                label="Senha"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={createForm.senha}
                onChange={(e) => setCreate('senha', e.target.value)}
                error={createErrors.senha}
              />
              <Input
                label="Confirmar Senha"
                type="password"
                placeholder="Repita a senha"
                value={createForm.confirmSenha}
                onChange={(e) => setCreate('confirmSenha', e.target.value)}
                error={createErrors.confirmSenha}
              />
            </div>
          </FormSection>
        </div>
      </Modal>

      {/* ── Modal Editar ── */}
      <Modal
        title={`Editar — ${editUser?.login ?? ''}`}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth={520}
        footer={
          <div className="cad-u-footer">
            <Button variant="ghost" size="sm" onClick={() => setEditOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        }
      >
        <div className="cad-u-form">
          <FormSection step={1} title="Identificação">
            <div className="frow frow--2">
              <Input label="ID" value={String(editUser?.id ?? '')} readOnly />
              <Input
                label="Nome / Login"
                value={editForm.login}
                onChange={(e) => setEdit('login', e.target.value)}
                autoFocus
              />
            </div>
            <div className="frow frow--2">
              <Input
                label="Setor"
                value={editForm.setor}
                onChange={(e) => setEdit('setor', e.target.value)}
              />
              <Input
                label="Local"
                value={editForm.local}
                onChange={(e) => setEdit('local', e.target.value)}
              />
            </div>
          </FormSection>

          <FormSection step={2} title="Vestuário">
            <div className="frow frow--3">
              <Input
                label="Camiseta"
                value={editForm.camiseta}
                onChange={(e) => setEdit('camiseta', e.target.value)}
              />
              <Input
                label="Calça"
                value={editForm.calca}
                onChange={(e) => setEdit('calca', e.target.value)}
              />
              <Input
                label="Sapato"
                value={editForm.sapato}
                onChange={(e) => setEdit('sapato', e.target.value)}
              />
            </div>
          </FormSection>

          <FormSection step={3} title="Status">
            <label className="cad-u-toggle">
              <div
                className={`cad-u-toggle__track${editForm.ativo ? ' cad-u-toggle__track--on' : ''}`}
                onClick={() => setEdit('ativo', !editForm.ativo)}
                role="switch"
                aria-checked={editForm.ativo}
                tabIndex={0}
                onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && setEdit('ativo', !editForm.ativo)}
              >
                <div className="cad-u-toggle__thumb" />
              </div>
              <span className="cad-u-toggle__label">
                {editForm.ativo ? 'Ativo — usuário pode acessar o sistema' : 'Inativo — acesso bloqueado'}
              </span>
            </label>
          </FormSection>
        </div>
      </Modal>
    </AppLayout>
  )
}
