import { useState, useEffect, useCallback } from 'react';
import type { ExpeditionUser } from '../../../types/expedition';
import './index.css';

interface UsersModalProps {
  isOpen: boolean;
  users: ExpeditionUser[];
  onClose: () => void;
  onSelect: (user: ExpeditionUser) => void;
}

export function UsersModal({ isOpen, users, onClose, onSelect }: UsersModalProps) {
  const [search, setSearch] = useState('');

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      setSearch('');
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const filtered = users.filter(
    (u) =>
      u.nome.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="users-modal__overlay" onClick={onClose}>
      <div
        className="users-modal__box"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Selecionar Funcionário"
      >
        <div className="users-modal__header">
          <span className="users-modal__title">Selecionar Funcionário</span>
          <button className="users-modal__close" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </div>
        <div className="users-modal__search-wrap">
          <input
            className="users-modal__search"
            type="text"
            placeholder="Buscar por nome ou ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>
        <div className="users-modal__table-wrap">
          <table className="users-modal__table">
            <thead>
              <tr>
                <th className="users-modal__th">ID</th>
                <th className="users-modal__th">Nome</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={2} className="users-modal__empty">
                    Nenhum funcionário encontrado.
                  </td>
                </tr>
              )}
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  className="users-modal__row"
                  onClick={() => onSelect(user)}
                >
                  <td className="users-modal__td users-modal__td--id">{user.id}</td>
                  <td className="users-modal__td">{user.nome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
