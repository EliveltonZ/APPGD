import type { ForecastProject } from '../../../../types/forecast';

function fmtDate(iso: string): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

interface ProjectInfoSectionProps {
  project: ForecastProject;
}

export function ProjectInfoSection({ project }: ProjectInfoSectionProps) {
  return (
    <div className="plan-modal__info-grid">
      <div className="plan-field">
        <label>Ordem de Compra</label>
        <input type="text" value={project.numOC} disabled />
      </div>
      <div className="plan-field">
        <label>Contrato</label>
        <input type="text" value={project.contrato} disabled />
      </div>
      <div className="plan-field">
        <label>N° Projeto</label>
        <input type="text" value={project.numProjeto} disabled />
      </div>
      <div className="plan-field">
        <label>Lote</label>
        <input type="text" value={project.lote} disabled />
      </div>
      <div className="plan-field plan-field--span2">
        <label>Cliente</label>
        <input type="text" value={project.cliente} disabled />
      </div>
      <div className="plan-field plan-field--span2">
        <label>Ambiente</label>
        <input type="text" value={project.ambiente} disabled />
      </div>
      <div className="plan-field">
        <label>Chegou Fábrica</label>
        <input type="text" value={fmtDate(project.chegouFabrica)} disabled />
      </div>
      <div className="plan-field">
        <label>Prazo</label>
        <input type="text" value={fmtDate(project.prazo)} disabled />
      </div>
      <div className="plan-field">
        <label>Previsão</label>
        <input type="text" value={fmtDate(project.previsao)} disabled />
      </div>
      <div className="plan-field">
        <label>E</label>
        <input type="text" value={project.e} disabled />
      </div>
    </div>
  );
}
