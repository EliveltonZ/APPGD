import type { StatusProject } from '../../../../types/status'

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function Field({
  label,
  value,
  span2,
}: {
  label: string
  value: string
  span2?: boolean
}) {
  return (
    <div className={`plan-field${span2 ? ' plan-field--span2' : ''}`}>
      <label>{label}</label>
      <input type="text" value={value} disabled readOnly />
    </div>
  )
}

interface ProjectInfoSectionProps {
  project: StatusProject
}

export function ProjectInfoSection({ project }: ProjectInfoSectionProps) {
  return (
    <div className="plan-modal__info-grid">
      <Field label="Ordem de Compra" value={project.numOC} />
      <Field label="Contrato"        value={project.contrato} />
      <Field label="N° Projeto"      value={project.nProjeto} />
      <Field label="Lote"            value={project.lote} />

      <Field label="Cliente"         value={project.cliente}  span2 />
      <Field label="Ambiente"        value={project.ambiente} span2 />

      <Field label="Corte Certo"     value={project.cc} />
      <Field label="Chegou Fábrica"  value={fmtDate(project.chegouFabrica)} />
      <Field label="Prazo"           value={fmtDate(project.prazo)} />
      <Field label="E"               value={project.e} />
    </div>
  )
}
