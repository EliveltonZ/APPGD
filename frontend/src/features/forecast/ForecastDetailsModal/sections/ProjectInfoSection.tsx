import type { ForecastProject, ForecastProjectDetail } from '../../../../types/forecast';

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function fmtPrazo(days: number): string {
  if (days < 0) return `Atrasado ${Math.abs(days)} dia${Math.abs(days) !== 1 ? 's' : ''}`;
  if (days === 0) return 'Hoje';
  return `${days} dia${days !== 1 ? 's' : ''}`;
}

function Field({ label, value, span2 }: { label: string; value: string; span2?: boolean }) {
  return (
    <div className={`plan-field${span2 ? ' plan-field--span2' : ''}`}>
      <label>{label}</label>
      <input type="text" value={value} disabled readOnly />
    </div>
  );
}

interface ProjectInfoSectionProps {
  project: ForecastProject;
  detail:  ForecastProjectDetail | null;
}

export function ProjectInfoSection({ project, detail }: ProjectInfoSectionProps) {
  return (
    <div className="plan-modal__info-grid">
      <Field label="Ordem de Compra" value={project.numOC} />
      <Field label="Contrato"        value={project.contrato} />
      <Field label="N° Projeto"      value={detail?.nProjeto || '—'} />
      <Field label="Lote"            value={project.lote || '—'} />

      <Field label="Cliente"         value={project.cliente}  span2 />
      <Field label="Ambiente"        value={project.ambiente} span2 />

      <Field label="Corte Certo"     value={project.corteCC || '—'} />
      <Field label="Chegou Fábrica"  value={detail ? fmtDate(detail.fabrica) : '—'} />
      <Field label="Prazo"           value={fmtPrazo(project.diasRestantes)} />
      <Field label="Previsão"        value={fmtDate(project.previsao)} />
    </div>
  );
}
