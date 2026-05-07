import type { AssistanceTeamMember } from '../../../../../types/assistenciaProducao';

interface Props {
  equipe: AssistanceTeamMember[];
}

export function AssistanceTeamTable({ equipe }: Props) {
  if (!equipe.length) {
    return <p className="ap-empty">Nenhum membro na equipe desta assistência.</p>;
  }

  return (
    <div className="ap-team-wrap">
      <table className="ap-team-table">
        <thead>
          <tr>
            <th style={{ width: 60 }}>ID</th>
            <th>Nome</th>
          </tr>
        </thead>
        <tbody>
          {equipe.map((m) => (
            <tr key={m.id}>
              <td>{m.id}</td>
              <td>{m.nome}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}