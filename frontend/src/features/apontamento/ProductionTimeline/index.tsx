import { STAGE_ORDER } from '../types';
import { TimelineStageCard } from '../TimelineStageCard';
import type { ApontamentoProject, StageId, StageAction, Operator } from '../types';
import './index.css';

interface Props {
  project:          ApontamentoProject;
  operators:        Operator[];
  dirtyStageIds:    ReadonlySet<StageId>;
  onStageAction:    (id: StageId, action: StageAction) => void;
  onOperatorChange: (id: StageId, operatorId: string, operatorNome: string) => void;
}

export function ProductionTimeline({ project, operators, dirtyStageIds, onStageAction, onOperatorChange }: Props) {
  return (
    <div className="apt-timeline">
      <div className="apt-timeline__grid">
        {STAGE_ORDER.map(id => (
          <TimelineStageCard
            key={id}
            stage={project.etapas[id]}
            operators={operators}
            isDirty={dirtyStageIds.has(id)}
            onAction={action => onStageAction(id, action)}
            onOperatorChange={(opId, opNome) => onOperatorChange(id, opId, opNome)}
          />
        ))}
      </div>
    </div>
  );
}
