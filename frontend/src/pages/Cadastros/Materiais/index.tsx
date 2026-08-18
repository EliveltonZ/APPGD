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
  fetchMateriais,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from '../../../services/materiais'
import type { Material, MaterialPayload } from '../../../services/materiais'
import '../index.css'

const UNIDADE_LABEL: Record<string, string> = { M2: 'M²', UN: 'UN' }

const COLUMNS: TableColumn<Material>[] = [
  { key: 'codigoInterno', label: 'Código',     type: 'text',   sortable: true,  filterable: true,  minWidth: 120 },
  { key: 'descricao',     label: 'Descrição',  type: 'text',   sortable: true,  filterable: true,  minWidth: 220 },
  {
    key: 'unidadeBase',
    label: 'Unidade',
    type: 'text',
    sortable: true,
    filterable: false,
    minWidth: 80,
    align: 'center',
    render: (v) => <span style={{ fontWeight: 600 }}>{UNIDADE_LABEL[v as string] ?? v}</span>,
  },
  {
    key: 'espessura',
    label: 'Esp. (mm)',
    type: 'number',
    sortable: true,
    filterable: false,
    minWidth: 90,
    align: 'right',
    render: (v) => (v != null ? `${v} mm` : '—'),
  },
  {
    key: 'estoqueMinimoUn',
    label: 'Mín. Estoque',
    type: 'number',
    sortable: true,
    filterable: false,
    minWidth: 110,
    align: 'right',
    render: (v) => (v != null ? String(v) : '—'),
  },
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
  codigoInterno: string
  descricao: string
  unidadeBase: 'M2' | 'UN'
  espessura: string
  m2PorUnidade: string
  estoqueMinimoUn: string
  ativo: boolean
}

function emptyForm(): FormState {
  return {
    codigoInterno:   '',
    descricao:       '',
    unidadeBase:     'M2',
    espessura:       '',
    m2PorUnidade:    '5.0416',
    estoqueMinimoUn: '',
    ativo:           true,
  }
}

function toPayload(f: FormState): MaterialPayload {
  const isM2 = f.unidadeBase === 'M2'
  return {
    codigo_interno:    f.codigoInterno.trim().toUpperCase(),
    descricao:         f.descricao.trim().toUpperCase(),
    unidade_base:      f.unidadeBase,
    espessura:         f.espessura      ? Number(f.espessura)      : null,
    m2_por_unidade:    isM2 && f.m2PorUnidade  ? Number(f.m2PorUnidade)  : null,
    estoque_minimo_un: isM2 && f.estoqueMinimoUn ? Number(f.estoqueMinimoUn) : null,
    ativo:             f.ativo,
  }
}

function fromMaterial(m: Material): FormState {
  return {
    codigoInterno:   m.codigoInterno,
    descricao:       m.descricao,
    unidadeBase:     m.unidadeBase,
    espessura:       m.espessura        != null ? String(m.espessura)        : '',
    m2PorUnidade:    m.m2PorUnidade     != null ? String(m.m2PorUnidade)     : '5.0416',
    estoqueMinimoUn: m.estoqueMinimoUn  != null ? String(m.estoqueMinimoUn)  : '',
    ativo:           m.ativo,
  }
}

export function CadastrosMateriaisPage() {
  const toast = useToast()
  const { data: rows = [], loading, reload } = useApiData(fetchMateriais)

  const [modalOpen, setModalOpen]     = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selected, setSelected]       = useState<Material | null>(null)
  const [form, setForm]               = useState<FormState>(emptyForm)
  const [saving, setSaving]           = useState(false)
  const [deleting, setDeleting]       = useState(false)

  const isEditing = selected !== null
  const isM2      = form.unidadeBase === 'M2'

  function field(key: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function openNew() {
    setSelected(null)
    setForm(emptyForm())
    setModalOpen(true)
  }

  function openEdit(row: Material) {
    setSelected(row)
    setForm(fromMaterial(row))
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setSelected(null)
  }

  async function handleSave() {
    if (!form.codigoInterno.trim() || !form.descricao.trim()) {
      toast.error('Código e Descrição são obrigatórios.')
      return
    }
    setSaving(true)
    try {
      const payload = toPayload(form)
      if (isEditing) {
        await updateMaterial(selected!.id, payload)
        toast.success('Material atualizado.')
      } else {
        await createMaterial(payload)
        toast.success('Material cadastrado.')
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
      await deleteMaterial(selected.id)
      toast.success('Material excluído.')
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
    <AppLayout pageTitle="Materiais">
      <div className="cad-main" style={{ padding: '20px 24px' }}>
        <div className="cad-main__header">
          <div>
            <h2 className="cad-main__title">Materiais</h2>
            {!loading && (
              <p className="cad-main__count">
                {rows.length} {rows.length === 1 ? 'material' : 'materiais'}
              </p>
            )}
          </div>
          <Button variant="primary" size="sm" onClick={openNew}>
            <Plus size={14} />
            Novo
          </Button>
        </div>

        <DataTable<Material>
          columns={COLUMNS}
          data={rows}
          rowKey="id"
          loading={loading}
          storageKey="dt:cad:materiais"
          showIndex
          onRowClick={openEdit}
          emptyMessage="Nenhum material cadastrado."
        />
      </div>

      <Modal
        title={isEditing ? `Editar — ${selected?.descricao}` : 'Novo Material'}
        isOpen={modalOpen}
        onClose={closeModal}
        maxWidth={480}
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label className="cad-field" style={{ gridColumn: '1 / -1' }}>
              <span className="cad-field__label">Código interno *</span>
              <input
                className="cad-field__input"
                type="text"
                placeholder="Ex: MDP15-BR-TX"
                value={form.codigoInterno}
                onChange={(e) => field('codigoInterno', e.target.value)}
                autoFocus
              />
            </label>

            <label className="cad-field" style={{ gridColumn: '1 / -1' }}>
              <span className="cad-field__label">Descrição *</span>
              <input
                className="cad-field__input"
                type="text"
                placeholder="Ex: MDP 15mm Branco TX"
                value={form.descricao}
                onChange={(e) => field('descricao', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            </label>

            <label className="cad-field">
              <span className="cad-field__label">Unidade base *</span>
              <select
                className="cad-field__input"
                value={form.unidadeBase}
                onChange={(e) => {
                  field('unidadeBase', e.target.value as 'M2' | 'UN')
                  if (e.target.value === 'UN') {
                    setForm((p) => ({ ...p, unidadeBase: 'UN', m2PorUnidade: '', estoqueMinimoUn: '' }))
                  }
                }}
              >
                <option value="M2">M² — chapa (conversão m²↔UN)</option>
                <option value="UN">UN — baixa 1 a 1</option>
              </select>
            </label>

            <label className="cad-field">
              <span className="cad-field__label">Espessura (mm)</span>
              <input
                className="cad-field__input"
                type="number"
                min="0"
                step="0.5"
                placeholder="Ex: 15"
                value={form.espessura}
                onChange={(e) => field('espessura', e.target.value)}
              />
            </label>

            {isM2 && (
              <>
                <label className="cad-field">
                  <span className="cad-field__label">m² por unidade</span>
                  <input
                    className="cad-field__input"
                    type="number"
                    min="0"
                    step="0.0001"
                    placeholder="5.0416 (2740×1840)"
                    value={form.m2PorUnidade}
                    onChange={(e) => field('m2PorUnidade', e.target.value)}
                  />
                </label>

                <label className="cad-field">
                  <span className="cad-field__label">Estoque mínimo (UN)</span>
                  <input
                    className="cad-field__input"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Deixe em branco para sem controle"
                    value={form.estoqueMinimoUn}
                    onChange={(e) => field('estoqueMinimoUn', e.target.value)}
                  />
                </label>
              </>
            )}

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
        </div>
      </Modal>

      <ConfirmModal
        isOpen={confirmOpen}
        message={`Excluir "${selected?.descricao}"? Esta ação não pode ser desfeita.`}
        confirmLabel={deleting ? 'Excluindo...' : 'Excluir'}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </AppLayout>
  )
}
