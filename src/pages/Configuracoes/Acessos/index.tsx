import { useState, useRef, useEffect } from 'react'
import { Shield, Edit2, X, Save, ChevronRight } from 'lucide-react'
import { AppLayout } from '../../../components/Layout/AppLayout'
import { ROUTE_GROUPS, ROUTE_ITEMS } from '../../../config/appRoutes'
import type { PermissionKey } from '../../../config/appRoutes'
import type { AuthUser, UserPermissions } from '../../../types/auth'
import { mockAuthUsers } from '../../../data/authMocks'
import { useAuth } from '../../../context/AuthContext'
import './index.css'

function GroupCheckbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean
  indeterminate: boolean
  onChange: () => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate
  }, [indeterminate])
  return <input type="checkbox" ref={ref} checked={checked} onChange={onChange} />
}

const TOTAL = ROUTE_ITEMS.length

export function ConfigAcessosPage() {
  const { user: currentUser, login } = useAuth()
  const [users, setUsers] = useState<AuthUser[]>(() => [...mockAuthUsers])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<UserPermissions | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const editingUser = editingId ? (users.find((u) => u.id === editingId) ?? null) : null

  function openEditor(user: AuthUser) {
    setEditingId(user.id)
    setDraft({ ...user.permissions })
    setExpanded(new Set())
  }

  function closeEditor() {
    setEditingId(null)
    setDraft(null)
    setExpanded(new Set())
  }

  function toggleExpand(groupId: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(groupId) ? next.delete(groupId) : next.add(groupId)
      return next
    })
  }

  function togglePermission(key: PermissionKey) {
    setDraft((prev) => (prev ? { ...prev, [key]: !prev[key] } : prev))
  }

  function groupStats(groupId: string) {
    const items = ROUTE_ITEMS.filter((r) => r.groupId === groupId)
    const active = draft ? items.filter((r) => draft[r.permissionKey as PermissionKey]).length : 0
    return { total: items.length, active }
  }

  function toggleGroupAll(groupId: string) {
    const { total, active } = groupStats(groupId)
    const selectAll = active < total
    const keys = ROUTE_ITEMS
      .filter((r) => r.groupId === groupId)
      .map((r) => r.permissionKey as PermissionKey)
    setDraft((prev) => {
      if (!prev) return prev
      const next = { ...prev }
      keys.forEach((k) => { next[k] = selectAll })
      return next
    })
  }

  function save() {
    if (!editingUser || !draft) return
    const updated: AuthUser = { ...editingUser, permissions: draft }
    const idx = mockAuthUsers.findIndex((u) => u.id === editingUser.id)
    if (idx !== -1) mockAuthUsers[idx] = updated
    setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? updated : u)))
    if (currentUser?.id === editingUser.id) login(updated)
    closeEditor()
  }

  function countActive(permissions: UserPermissions) {
    return Object.values(permissions).filter(Boolean).length
  }

  return (
    <AppLayout pageTitle="Acessos">
      <div className="ac-page">
        <div className="ac-page-header">
          <Shield size={18} />
          <h2>Controle de Acessos</h2>
        </div>

        <div className="ac-card">
          <table className="ac-table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Cargo</th>
                <th>Permissões</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const active = countActive(user.permissions)
                const pct = (active / TOTAL) * 100
                const isMe = currentUser?.id === user.id
                return (
                  <tr key={user.id}>
                    <td>
                      <span className="ac-user-name">{user.nome}</span>
                      {isMe && <span className="ac-badge-you">você</span>}
                    </td>
                    <td className="ac-role">{user.role}</td>
                    <td>
                      <div className="ac-perm-row">
                        <div className="ac-bar">
                          <div className="ac-bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="ac-perm-label">{active} / {TOTAL}</span>
                      </div>
                    </td>
                    <td className="ac-actions">
                      <button className="ac-btn-edit" onClick={() => openEditor(user)}>
                        <Edit2 size={13} />
                        Editar
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editingUser && draft && (
        <>
          <div className="ac-overlay" onClick={closeEditor} />
          <div className="ac-panel">
            {/* Header */}
            <div className="ac-panel-header">
              <div>
                <p className="ac-panel-name">{editingUser.nome}</p>
                <p className="ac-panel-role">{editingUser.role}</p>
              </div>
              <button className="ac-btn-close" onClick={closeEditor} aria-label="Fechar">
                <X size={17} />
              </button>
            </div>

            {/* Scrollable permission tree */}
            <div className="ac-panel-body">
              <nav className="ac-nav">
                {ROUTE_GROUPS.map((group) => {
                  const items = ROUTE_ITEMS.filter((r) => r.groupId === group.id)
                  if (items.length === 0) return null

                  const { total, active } = groupStats(group.id)
                  const isExpanded = expanded.has(group.id)
                  const Icon = group.icon

                  return (
                    <div
                      key={group.id}
                      className={`ac-group${isExpanded ? ' ac-group--expanded' : ''}${active > 0 ? ' ac-group--has-active' : ''}`}
                    >
                      <button
                        type="button"
                        className="ac-group-trigger"
                        onClick={() => toggleExpand(group.id)}
                      >
                        {/* Checkbox stops propagation so it doesn't toggle accordion */}
                        <span
                          className="ac-group-checkbox"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <GroupCheckbox
                            checked={active === total}
                            indeterminate={active > 0 && active < total}
                            onChange={() => toggleGroupAll(group.id)}
                          />
                        </span>

                        <span className="ac-group-icon">
                          <Icon size={14} />
                        </span>
                        <span className="ac-group-label">{group.label}</span>
                        <span className="ac-group-count">{active}/{total}</span>
                        <ChevronRight size={12} className="ac-group-chevron" />
                      </button>

                      <div className="ac-group-list-wrap">
                        <ul className="ac-group-list">
                          {items.map((item) => (
                            <li key={item.permissionKey}>
                              <label className="ac-item">
                                <input
                                  type="checkbox"
                                  checked={draft[item.permissionKey as PermissionKey]}
                                  onChange={() =>
                                    togglePermission(item.permissionKey as PermissionKey)
                                  }
                                />
                                <span className="ac-item-dot" />
                                <span>{item.menuLabel}</span>
                              </label>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )
                })}
              </nav>
            </div>

            {/* Footer */}
            <div className="ac-panel-footer">
              <button className="btn btn-ghost btn-sm" onClick={closeEditor}>
                Cancelar
              </button>
              <button className="btn btn-primary btn-sm" onClick={save}>
                <Save size={13} />
                Salvar
              </button>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  )
}
