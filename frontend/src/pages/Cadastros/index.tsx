import { useState, useCallback, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { AppLayout } from '../../components/Layout/AppLayout'
import { DataTable } from '../../components/DataTable'
import type { TableColumn } from '../../components/DataTable'
import { Modal } from '../../components/Modal'
import { ConfirmModal } from '../../components/ConfirmModal'
import { Button } from '../../components/Button'
import { useToast } from '../../context/ToastContext'
import { useParamData } from '../../hooks/useParamData'
import {
  listCadastro,
  createCadastro,
  updateCadastro,
  deleteCadastro,
} from '../../services/cadastros'
import type { CadastroRow } from '../../services/cadastros'
import './index.css'

interface EntityConfig {
  key: string
  label: string
  labelPlaceholder: string
  hasPassword?: boolean
}

const ENTITIES: EntityConfig[] = [
  { key: 'vendedores',    label: 'Vendedores',       labelPlaceholder: 'Nome do vendedor'    },
  { key: 'liberadores',   label: 'Liberadores',      labelPlaceholder: 'Nome do liberador'   },
  { key: 'montadores',    label: 'Montadores',       labelPlaceholder: 'Nome do montador', hasPassword: true },
  { key: 'causas',        label: 'Causas',           labelPlaceholder: 'Descrição da causa'  },
  { key: 'falhas',        label: 'Falhas',           labelPlaceholder: 'Descrição da falha'  },
  { key: 'etapas',        label: 'Etapas',           labelPlaceholder: 'Nome da etapa'       },
  { key: 'tipo-cliente',  label: 'Tipo de Cliente',  labelPlaceholder: 'Tipo de cliente'     },
  { key: 'tipo-contrato', label: 'Tipo de Contrato', labelPlaceholder: 'Tipo de contrato'    },
  { key: 'lojas',         label: 'Lojas',            labelPlaceholder: 'Nome da loja'        },
  { key: 'clientes',      label: 'Clientes',         labelPlaceholder: 'Nome do cliente'     },
]

interface EntityGroup {
  label: string
  path: string
  keys: string[]
}

const ENTITY_GROUPS: EntityGroup[] = [
  { label: 'Equipe',    path: '/cadastros/equipe',    keys: ['vendedores', 'liberadores', 'montadores'] },
  { label: 'Qualidade', path: '/cadastros/qualidade', keys: ['causas', 'falhas', 'etapas'] },
  { label: 'Comercial', path: '/cadastros/comercial', keys: ['tipo-cliente', 'tipo-contrato', 'lojas'] },
  { label: 'Clientes',  path: '/cadastros/clientes',  keys: ['clientes'] },
]

const COLUMNS: TableColumn<CadastroRow>[] = [
  { key: 'id',    label: 'ID',   type: 'number', sortable: true,  filterable: false, minWidth: 60,  align: 'center' },
  { key: 'label', label: 'Nome', type: 'text',   sortable: true,  filterable: true,  minWidth: 240 },
]

export function CadastrosPage() {
  const toast = useToast()
  const { pathname } = useLocation()

  const activeGroup = ENTITY_GROUPS.find((g) => g.path === pathname) ?? ENTITY_GROUPS[0]
  const groupEntities = activeGroup.keys.map((k) => ENTITIES.find((e) => e.key === k)!)

  const [activeKey, setActiveKey] = useState<string>(activeGroup.keys[0])

  useEffect(() => {
    const group = ENTITY_GROUPS.find((g) => g.path === pathname) ?? ENTITY_GROUPS[0]
    setActiveKey(group.keys[0])
  }, [pathname])

  const activeConfig = ENTITIES.find((e) => e.key === activeKey)!

  const fetchFn = useCallback((entity: string) => listCadastro(entity), [])
  const { data: rows = [], loading, reload } = useParamData(fetchFn, activeKey)

  const [modalOpen, setModalOpen]         = useState(false)
  const [confirmOpen, setConfirmOpen]     = useState(false)
  const [selected, setSelected]           = useState<CadastroRow | null>(null)
  const [labelValue, setLabelValue]       = useState('')
  const [passwordValue, setPasswordValue] = useState('')
  const [saving, setSaving]               = useState(false)
  const [deleting, setDeleting]           = useState(false)

  function openNew() {
    setSelected(null)
    setLabelValue('')
    setPasswordValue('')
    setModalOpen(true)
  }

  function openEdit(row: CadastroRow) {
    setSelected(row)
    setLabelValue(row.label)
    setPasswordValue(row.password ?? '')
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setSelected(null)
  }

  async function handleSave() {
    const trimmed = labelValue.trim()
    if (!trimmed) return
    setSaving(true)
    try {
      const payload: Omit<CadastroRow, 'id'> = { label: trimmed }
      if (activeConfig.hasPassword) payload.password = passwordValue || null
      if (selected) {
        await updateCadastro(activeKey, selected.id, payload)
        toast.success('Registro atualizado.')
      } else {
        await createCadastro(activeKey, payload)
        toast.success('Registro criado.')
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
      await deleteCadastro(activeKey, selected.id)
      toast.success('Registro excluído.')
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

  function handleEntitySelect(key: string) {
    if (key === activeKey) return
    setActiveKey(key)
    closeModal()
    setConfirmOpen(false)
  }

  const isEditing = selected !== null

  return (
    <AppLayout pageTitle="Cadastros">
      <div className="cad-page">
        {/* ── Seletor de entidades ── */}
        <aside className="cad-sidebar">
          <p className="cad-sidebar__title">{activeGroup.label}</p>
          <nav className="cad-sidebar__nav">
            {groupEntities.map((e) => (
              <button
                key={e.key}
                className={`cad-sidebar__item${activeKey === e.key ? ' cad-sidebar__item--active' : ''}`}
                onClick={() => handleEntitySelect(e.key)}
              >
                {e.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Conteúdo principal ── */}
        <div className="cad-main">
          <div className="cad-main__header">
            <div>
              <h2 className="cad-main__title">{activeConfig.label}</h2>
              {!loading && (
                <p className="cad-main__count">
                  {rows.length} {rows.length === 1 ? 'registro' : 'registros'}
                </p>
              )}
            </div>
            <Button variant="primary" size="sm" onClick={openNew}>
              <Plus size={14} />
              Novo
            </Button>
          </div>

          <DataTable<CadastroRow>
            columns={COLUMNS}
            data={rows}
            rowKey="id"
            loading={loading}
            storageKey={`dt:cad:${activeKey}`}
            showIndex
            onRowClick={openEdit}
            emptyMessage="Nenhum registro cadastrado."
          />
        </div>
      </div>

      {/* ── Modal de cadastro / edição ── */}
      <Modal
        title={isEditing ? `Editar — ${activeConfig.label}` : `Novo — ${activeConfig.label}`}
        isOpen={modalOpen}
        onClose={closeModal}
        maxWidth={420}
        footer={
          <div className="cad-modal-footer">
            {isEditing && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setConfirmOpen(true)}
                disabled={saving}
              >
                Excluir
              </Button>
            )}
            <div className="cad-modal-footer__right">
              <Button variant="ghost" size="sm" onClick={closeModal} disabled={saving}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                disabled={!labelValue.trim() || saving}
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        }
      >
        <div className="cad-modal-body">
          <label className="cad-field">
            <span className="cad-field__label">Nome / Descrição</span>
            <input
              className="cad-field__input"
              type="text"
              placeholder={activeConfig.labelPlaceholder}
              value={labelValue}
              onChange={(e) => setLabelValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
            />
          </label>

          {activeConfig.hasPassword && (
            <label className="cad-field">
              <span className="cad-field__label">Senha (opcional)</span>
              <input
                className="cad-field__input"
                type="password"
                placeholder="Deixe em branco para não alterar"
                value={passwordValue}
                onChange={(e) => setPasswordValue(e.target.value)}
              />
            </label>
          )}
        </div>
      </Modal>

      {/* ── Confirmação de exclusão ── */}
      <ConfirmModal
        isOpen={confirmOpen}
        message={`Excluir "${selected?.label}"? Esta ação não pode ser desfeita.`}
        confirmLabel={deleting ? 'Excluindo...' : 'Excluir'}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </AppLayout>
  )
}
