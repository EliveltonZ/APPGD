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
  fetchLocalizacoes,
  createLocalizacao,
  updateLocalizacao,
  deleteLocalizacao,
} from '../../../services/localizacoes'
import type { Localizacao, LocalizacaoPayload } from '../../../services/localizacoes'
import '../index.css'

const COLUMNS: TableColumn<Localizacao>[] = [
  { key: 'codigo',    label: 'Código',    type: 'text', sortable: true, filterable: true,  minWidth: 130 },
  { key: 'descricao', label: 'Descrição', type: 'text', sortable: true, filterable: true,  minWidth: 260,
    render: (v) => <span>{v ?? '—'}</span> },
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
  codigo:    string
  descricao: string
  ativo:     boolean
}

function emptyForm(): FormState {
  return { codigo: '', descricao: '', ativo: true }
}

function fromLocalizacao(l: Localizacao): FormState {
  return { codigo: l.codigo, descricao: l.descricao ?? '', ativo: l.ativo }
}

function toPayload(f: FormState): LocalizacaoPayload {
  return {
    codigo:    f.codigo.trim().toUpperCase(),
    descricao: f.descricao.trim() || null,
    ativo:     f.ativo,
  }
}

export function CadastrosLocalizacoesPage() {
  const toast = useToast()
  const { data: rows = [], loading, reload } = useApiData(fetchLocalizacoes)

  const [modalOpen, setModalOpen]     = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selected, setSelected]       = useState<Localizacao | null>(null)
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

  function openEdit(row: Localizacao) {
    setSelected(row)
    setForm(fromLocalizacao(row))
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setSelected(null)
  }

  async function handleSave() {
    if (!form.codigo.trim()) {
      toast.error('O código é obrigatório.')
      return
    }
    setSaving(true)
    try {
      const payload = toPayload(form)
      if (isEditing) {
        await updateLocalizacao(selected!.id, payload)
        toast.success('Localização atualizada.')
      } else {
        await createLocalizacao(payload)
        toast.success('Localização cadastrada.')
      }
      closeModal()
      reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!selected) return
    setDeleting(true)
    try {
      await deleteLocalizacao(selected.id)
      toast.success('Localização excluída.')
      setConfirmOpen(false)
      closeModal()
      reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir.')
      setConfirmOpen(false)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AppLayout pageTitle="Localizações">
      <div className="cad-main" style={{ padding: '20px 24px' }}>
        <div className="cad-main__header">
          <div>
            <h2 className="cad-main__title">Localizações de Estoque</h2>
            {!loading && (
              <p className="cad-main__count">
                {rows.length} {rows.length === 1 ? 'localização' : 'localizações'}
              </p>
            )}
          </div>
          <Button variant="primary" size="sm" onClick={openNew}>
            <Plus size={14} />
            Nova
          </Button>
        </div>

        <DataTable<Localizacao>
          columns={COLUMNS}
          data={rows}
          rowKey="id"
          loading={loading}
          storageKey="dt:cad:localizacoes"
          showIndex
          onRowClick={openEdit}
          emptyMessage="Nenhuma localização cadastrada."
        />
      </div>

      <Modal
        title={isEditing ? `Editar — ${selected?.codigo}` : 'Nova Localização'}
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
            <span className="cad-field__label">Código *</span>
            <input
              className="cad-field__input"
              type="text"
              placeholder="Ex: R1-01-01"
              value={form.codigo}
              onChange={(e) => field('codigo', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
            />
          </label>

          <label className="cad-field">
            <span className="cad-field__label">Descrição</span>
            <input
              className="cad-field__input"
              type="text"
              placeholder="Ex: Rua 1, Gondola 1, Prateleira 1"
              value={form.descricao}
              onChange={(e) => field('descricao', e.target.value)}
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
        message={`Excluir localização "${selected?.codigo}"? Esta ação não pode ser desfeita.`}
        confirmLabel={deleting ? 'Excluindo...' : 'Excluir'}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </AppLayout>
  )
}
