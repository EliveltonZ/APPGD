import { Trash2 } from 'lucide-react';
import type { TeamMember } from '../../../../types/assistencia';
import './index.css';

interface SelectedTeamTableProps {
  equipe: TeamMember[];
  onRemove: (id: number) => void;
}

export function SelectedTeamTable({ equipe, onRemove }: SelectedTeamTableProps) {
  if (!equipe.length) {
    return (
      <p className="as-empty">Nenhum montador adicionado à equipe.</p>
    );
  }

  return (
    <div className="as-team-table-wrap">
      <table className="as-team-table">
        <thead>
          <tr>
            <th style={{ width: 60 }}>ID</th>
            <th>Montador</th>
            <th style={{ width: 60 }}></th>
          </tr>
        </thead>
        <tbody>
          {equipe.map((m) => (
            <tr key={m.id}>
              <td className="as-team-table__id">{m.id}</td>
              <td>{m.nome}</td>
              <td>
                <button
                  className="as-table-remove"
                  onClick={() => onRemove(m.id)}
                  title="Remover montador"
                  type="button"
                >
                  <Trash2 size={13} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}