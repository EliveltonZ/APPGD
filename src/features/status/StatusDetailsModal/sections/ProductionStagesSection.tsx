import { ProductionStageCard } from '../../../../components/ProductionStageCard';
import type { StatusProject, StageName } from '../../../../types/status';

const STAGES: { id: StageName; label: string }[] = [
  { id: 'corte',        label: 'Corte'        },
  { id: 'customizacao', label: 'Customização' },
  { id: 'coladeira',    label: 'Coladeira'    },
  { id: 'usinagem',     label: 'Usinagem'     },
  { id: 'paineis',      label: 'Painéis'      },
  { id: 'montagem',     label: 'Montagem'     },
  { id: 'acabamento',   label: 'Acabamento'   },
  { id: 'embalagem',    label: 'Embalagem'    },
];

interface ProductionStagesSectionProps {
  project: StatusProject;
}

export function ProductionStagesSection({ project }: ProductionStagesSectionProps) {
  return (
    <div className="plan-modal__stages-grid">
      {STAGES.map((cfg, i) => {
        const s = project.stages[cfg.id];
        return (
          <ProductionStageCard
            key={cfg.id}
            index={i + 1}
            label={cfg.label}
            status={s.status}
            inicio={s.inicio}
            fim={s.fim}
            responsavel={s.responsavel}
            pausa={s.pausa}
          />
        );
      })}
    </div>
  );
}