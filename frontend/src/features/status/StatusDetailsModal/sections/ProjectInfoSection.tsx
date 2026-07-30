import type { StatusProject } from '../../../../types/status'

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function fmtPrazo(p: StatusProject): string {
  if (p.status === 'ENTREGUE') return fmtDate(p.entregue)
  if (p.prazo < 0) return `Atrasado ${Math.abs(p.prazo)} dia${Math.abs(p.prazo) !== 1 ? 's' : ''}`
  if (p.prazo === 0) return 'Hoje'
  return `${p.prazo} dia${p.prazo !== 1 ? 's' : ''}`
}

function Field({ label, value, span2 }: { label: string; value: string; span2?: boolean }) {
  return (
    <div className={`plan-field${span2 ? ' plan-field--span2' : ''}`}>
      <label>{label}</label>
      <input type="text" value={value} disabled readOnly />
    </div>
  )
}

interface ProjectInfoSectionProps {
  project: StatusProject
  lote?:   string
}

export function ProjectInfoSection({ project, lote }: ProjectInfoSectionProps) {
  return (
    <div className="plan-modal__info-grid">
      <Field label="Ordem de Compra" value={project.numOC} />
      <Field label="Contrato"        value={project.contrato} />
      <Field label="N° Projeto"      value={project.nProjeto} />
      <Field label="Lote"            value={lote ?? '—'} />

      <Field label="Cliente"         value={project.cliente}  span2 />
      <Field label="Ambiente"        value={project.ambiente} span2 />

      <Field label="Corte Certo"     value={project.cc} />
      <Field label="Chegou Fábrica"  value={fmtDate(project.fabrica)} />
      <Field label="Prazo"           value={fmtPrazo(project)} />
      <Field label="Etapa"           value={project.e} />
    </div>
  )
}
