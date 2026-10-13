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
import { getErrorMessage } from '../../../utils/errorMessage'
import '../index.css'

const COLUMNS: TableColumn<Localizacao>[] = [
  { key: 'codigo',     label: 'Código',     type: 'text', sortable: true, filterable: true, minWidth: 130 },
  { key: 'rua',        label: 'Rua',        type: 'text', sortable: true, filterable: true, minWidth: 70, align: 'center' },
  { key: 'prateleira', label: 'Prateleira', type: 'text', sortable: true, filterable: true, minWidth: 90, align: 'center' },
  { key: 'nivel',       label: 'Nível',      type: 'text', sortable: true, filterable: true, minWidth: 70, align: 'center' },
  { key: 'divisao',    label: 'Divisão',    type: 'text', sortable: true, filterable: true, minWidth: 80, align: 'center' },
  { key: 'descricao', label: 'Descrição', type: 'text', sortable: true, filterable: true,  minWidth: 220,
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
  rua:        string
  prateleira: string
  nivel:      string
  divisao:    string
  descricao:  string
  ativo:      boolean
}

function emptyForm(): FormState {
  return { rua: '', prateleira: '', nivel: '', divisao: '', descricao: '', ativo: true }
}

function fromLocalizacao(l: Localizacao): FormState {
  return {
    rua: l.rua,
    prateleira: l.prateleira,
    nivel: l.nivel,
    divisao: l.divisao,
    descricao: l.descricao ?? '',
    ativo: l.ativo,
  }
}

function toPayload(f: FormState): LocalizacaoPayload {
  return {
    rua:        f.rua.trim().toUpperCase(),
    prateleira: f.prateleira.trim().toUpperCase(),
    nivel:      f.nivel.trim().toUpperCase(),
    divisao:    f.divisao.trim().toUpperCase(),
    descricao:  f.descricao.trim() || null,
    ativo:      f.ativo,
  }
}

function previewCodigo(f: FormState): string {
  const partes = [f.rua, f.prateleira, f.nivel, f.divisao].map((p) => p.trim().toUpperCase())
  if (partes.some((p) => !p)) return '—'
  return partes.join('-')
}

export function CadastrosLocalizacoesPage() {
  const toast = useToast()
  const { data: rows = [], loading, refetch: reload } = useApiData(fetchLocalizacoes)

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
    if (!form.rua.trim() || !form.prateleira.trim() || !form.nivel.trim() || !form.divisao.trim()) {
      toast.error('Informe rua, prateleira, nível e divisão.')
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
      toast.error(getErrorMessage(err, 'Erro ao salvar.'))
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
      toast.error(getErrorMessage(err, 'Erro ao excluir.'))
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
        maxWidth={460}
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
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
            Endereço: <strong style={{ color: 'var(--text-h)' }}>{previewCodigo(form)}</strong>
          </p>

          <div className="frow frow--2">
            <label className="cad-field">
              <span className="cad-field__label">Rua *</span>
              <input
                className="cad-field__input"
                type="text"
                placeholder="Ex: 01"
                value={form.rua}
                onChange={(e) => field('rua', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                autoFocus
              />
            </label>
            <label className="cad-field">
              <span className="cad-field__label">Prateleira *</span>
              <input
                className="cad-field__input"
                type="text"
                placeholder="Ex: 01"
                value={form.prateleira}
                onChange={(e) => field('prateleira', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            </label>
          </div>

          <div className="frow frow--2">
            <label className="cad-field">
              <span className="cad-field__label">Nível *</span>
              <input
                className="cad-field__input"
                type="text"
                placeholder="Ex: 03"
                value={form.nivel}
                onChange={(e) => field('nivel', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            </label>
            <label className="cad-field">
              <span className="cad-field__label">Divisão *</span>
              <input
                className="cad-field__input"
                type="text"
                placeholder="Ex: D"
                value={form.divisao}
                onChange={(e) => field('divisao', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            </label>
          </div>

          <label className="cad-field">
            <span className="cad-field__label">Descrição</span>
            <input
              className="cad-field__input"
              type="text"
              placeholder="Opcional — ex: Galpão A"
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
