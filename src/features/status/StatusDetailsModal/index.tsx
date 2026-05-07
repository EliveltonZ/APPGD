import { Modal } from '../../../components/Modal'
import { StatusBadge } from '../StatusBadge'
import { ProjectInfoSection } from './sections/ProjectInfoSection'
import { ProductionStagesSection } from './sections/ProductionStagesSection'
import { RelatedPurchasesTable } from './sections/RelatedPurchasesTable'
import type { StatusProject } from '../../../types/status'

const STATUS_LABEL: Record<string, string> = {
  aguardando:  'Aguardando',
  em_producao: 'Em Produção',
  concluido:   'Concluído',
  atrasado:    'Atrasado',
}

interface StatusDetailsModalProps {
  isOpen: boolean
  project: StatusProject | null
  onClose: () => void
}

export function StatusDetailsModal({ isOpen, project, onClose }: StatusDetailsModalProps) {
  const title = project
    ? `${project.numOC} — ${project.cliente}`
    : 'Detalhes do Projeto'

  return (
    <Modal title={title} isOpen={isOpen} onClose={onClose} maxWidth={1060}>
      {project && (
        <div className="plan-modal">

          {/* 1 — Identificação */}
          <section className="plan-modal__section">
            <div className="plan-modal__section-header">
              <h3 className="plan-modal__section-title">Identificação do Projeto</h3>
              <StatusBadge
                status={project.status}
                label={STATUS_LABEL[project.status]}
              />
            </div>
            <ProjectInfoSection project={project} />
          </section>

          {/* 2 — Etapas de produção */}
          <section className="plan-modal__section">
            <h3 className="plan-modal__section-title">Etapas de Produção</h3>
            <ProductionStagesSection project={project} />
          </section>

          {/* 3 — Observações */}
          {project.observacoes && (
            <section className="plan-modal__section">
              <h3 className="plan-modal__section-title">Observações</h3>
              <textarea
                className="plan-modal__textarea"
                value={project.observacoes}
                disabled
                rows={3}
              />
            </section>
          )}

          {/* 4 — Compras / Acessórios */}
          <section className="plan-modal__section">
            <h3 className="plan-modal__section-title">Compras / Acessórios</h3>
            <RelatedPurchasesTable compras={project.compras} />
          </section>

        </div>
      )}
    </Modal>
  )
}
