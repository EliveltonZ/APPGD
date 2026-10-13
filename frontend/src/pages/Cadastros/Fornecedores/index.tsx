import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AppLayout } from '../../../components/Layout/AppLayout'
import { DataTable } from '../../../components/DataTable'
import type { TableColumn } from '../../../components/DataTable'
import { Modal } from '../../../components/Modal'
import { ConfirmModal } from '../../../components/ConfirmModal'
import { Button } from '../../../components/Button'
import { useToast } from '../../../context/ToastContext'
import { useApiData } from '../../../hooks/useApiData'
import {
  fetchFornecedores,
  createFornecedor,
  updateFornecedor,
  deleteFornecedor,
} from '../../../services/fornecedores'
import type { Fornecedor, FornecedorPayload } from '../../../services/fornecedores'
import { getErrorMessage } from '../../../utils/errorMessage'
import '../index.css'

const COLUMNS: TableColumn<Fornecedor>[] = [
  { key: 'nome',    label: 'Nome',    type: 'text', sortable: true, filterable: true, minWidth: 220 },
  { key: 'cnpj',    label: 'CNPJ',    type: 'text', sortable: true, filterable: true, minWidth: 150,
    render: (v) => <span>{(v as string | null) ?? '—'}</span> },
  { key: 'contato', label: 'Contato', type: 'text', sortable: true, filterable: true, minWidth: 180,
    render: (v) => <span>{(v as string | null) ?? '—'}</span> },
  {
    key: 'ativo',
    label: 'Ativo',
    type: 'text',
    sortable: true,
    filterable: false,
    minWidth: 70,
    align: 'center',
    render: (v) => (
      <span style={{
        display: 'inline-block',
        padding: '1px 8px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
        background: v ? 'var(--success-subtle, #dcfce7)' : 'var(--border)',
        color: v ? 'var(--success, #16a34a)' : 'var(--text-muted)',
      }}>
        {v ? 'Sim' : 'Não'}
      </span>
    ),
  },
]

interface FormState {
  nome:    string
  cnpj:    string
  contato: string
  ativo:   boolean
}

function emptyForm(): FormState {
  return { nome: '', cnpj: '', contato: '', ativo: true }
}

function fromFornecedor(f: Fornecedor): FormState {
  return { nome: f.nome, cnpj: f.cnpj ?? '', contato: f.contato ?? '', ativo: f.ativo }
}

function toPayload(f: FormState): FornecedorPayload {
  return {
    nome:    f.nome.trim(),
    cnpj:    f.cnpj.trim() || null,
    contato: f.contato.trim() || null,
    ativo:   f.ativo,
  }
}

export function CadastrosFornecedoresPage() {
  const toast = useToast()
  const { data: rows = [], loading, refetch: reload } = useApiData(fetchFornecedores)

  const [modalOpen, setModalOpen]     = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selected, setSelected]       = useState<Fornecedor | null>(null)
  const [form, setForm]               = useState<FormState>(emptyForm)
  const [saving, setSaving]           = useState(false)
  const [deleting, setDeleting]       = useState(false)

  const isEditing = selected !== null

  function field<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function openNew() {
    setSelected(null)
    setForm(emptyForm())
    setModalOpen(true)
  }

  function openEdit(row: Fornecedor) {
    setSelected(row)
    setForm(fromFornecedor(row))
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setSelected(null)
  }

  async function handleSave() {
    if (!form.nome.trim()) {
      toast.error('O nome é obrigatório.')
      return
    }
    setSaving(true)
    try {
      const payload = toPayload(form)
      if (isEditing) {
        await updateFornecedor(selected!.id, payload)
        toast.success('Fornecedor atualizado.')
      } else {
        await createFornecedor(payload)
        toast.success('Fornecedor cadastrado.')
      }
      closeModal()
      reload()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao salvar.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!selected) return
    setDeleting(true)
    try {
      await deleteFornecedor(selected.id)
      toast.success('Fornecedor excluído.')
      setConfirmOpen(false)
      closeModal()
      reload()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao excluir.'))
      setConfirmOpen(false)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AppLayout pageTitle="Fornecedores">
      <div className="cad-main" style={{ padding: '20px 24px' }}>
        <div className="cad-main__header">
          <div>
            <h2 className="cad-main__title">Fornecedores</h2>
            {!loading && (
              <p className="cad-main__count">
                {rows.length} {rows.length === 1 ? 'fornecedor' : 'fornecedores'}
              </p>
            )}
          </div>
          <Button variant="primary" size="sm" onClick={openNew}>
            <Plus size={14} />
            Novo
          </Button>
        </div>

        <DataTable<Fornecedor>
          columns={COLUMNS}
          data={rows}
          rowKey="id"
          loading={loading}
          storageKey="dt:cad:fornecedores"
          showIndex
          onRowClick={openEdit}
          emptyMessage="Nenhum fornecedor cadastrado."
        />
      </div>

      <Modal
        title={isEditing ? `Editar — ${selected?.nome}` : 'Novo Fornecedor'}
        isOpen={modalOpen}
        onClose={closeModal}
        maxWidth={420}
        footer={
          <div className="cad-modal-footer">
            {isEditing && (
              <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)} disabled={saving}>
                Excluir
              </Button>
            )}
            <div className="cad-modal-footer__right">
              <Button variant="ghost" size="sm" onClick={closeModal} disabled={saving}>Cancelar</Button>
              <Button variant="primary" size="sm" onClick={handleSave} loading={saving}>Salvar</Button>
            </div>
          </div>
        }
      >
        <div className="cad-modal-body">
          <label className="cad-field">
            <span className="cad-field__label">Nome *</span>
            <input
              className="cad-field__input"
              type="text"
              placeholder="Ex: Marcenaria Alfa Ltda"
              value={form.nome}
              onChange={(e) => field('nome', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
            />
          </label>

          <label className="cad-field">
            <span className="cad-field__label">CNPJ</span>
            <input
              className="cad-field__input"
              type="text"
              placeholder="Ex: 00.000.000/0001-00"
              value={form.cnpj}
              onChange={(e) => field('cnpj', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </label>

          <label className="cad-field">
            <span className="cad-field__label">Contato</span>
            <input
              className="cad-field__input"
              type="text"
              placeholder="Ex: (11) 99999-0000"
              value={form.contato}
              onChange={(e) => field('contato', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </label>

          <label className="cad-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={form.ativo}
              onChange={(e) => field('ativo', e.target.checked)}
              style={{ width: 15, height: 15, cursor: 'pointer' }}
            />
            <span className="cad-field__label" style={{ margin: 0 }}>Ativo</span>
          </label>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={confirmOpen}
        message={`Excluir fornecedor "${selected?.nome}"? Esta ação não pode ser desfeita.`}
        confirmLabel={deleting ? 'Excluindo...' : 'Excluir'}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </AppLayout>
  )
}
