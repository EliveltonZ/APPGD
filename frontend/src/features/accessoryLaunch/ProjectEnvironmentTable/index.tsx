import type { AccessoryLaunchProject } from '../../../types/accessoryLaunch';
import './index.css';

interface ProjectEnvironmentTableProps {
  projects: AccessoryLaunchProject[];
  onSelect: (project: AccessoryLaunchProject) => void;
  loading?: boolean;
}

function fmt(dateStr: string): string {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export function ProjectEnvironmentTable({ projects, onSelect, loading }: ProjectEnvironmentTableProps) {
  if (loading) return <div className="penv-table__empty">Carregando...</div>;
  if (projects.length === 0) return <div className="penv-table__empty">Nenhum projeto encontrado.</div>;

  return (
    <div className="penv-table__wrapper">
      <table className="penv-table">
        <thead>
          <tr>
            <th>N° OC</th>
            <th>Contrato</th>
            <th>Cliente</th>
            <th>Ambiente</th>
            <th>Entrega</th>
            <th className="penv-th--center">Itens</th>
            <th className="penv-th--center">Atrasados</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr
              key={p.id}
              className={`penv-row${p.atrasados > 0 ? ' penv-row--alert' : ''}`}
              onClick={() => onSelect(p)}
            >
              <td>{p.numOC}</td>
              <td>{p.contrato}</td>
              <td>{p.cliente}</td>
              <td>{p.ambiente}</td>
              <td>{fmt(p.entrega)}</td>
              <td className="penv-td--center">{p.total}</td>
              <td className="penv-td--center">
                {p.atrasados > 0 ? (
                  <span className="penv-count penv-count--atrasado">{p.atrasados}</span>
                ) : (
                  <span className="penv-count penv-count--ok">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
