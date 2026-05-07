import { FORECAST_STAGES } from '../../../../data/forecastConfig';
import { ProductionStageCard } from '../../../../components/ProductionStageCard';
import type { ForecastProject } from '../../../../types/forecast';

interface ProductionStagesTimelineProps {
  project: ForecastProject;
}

export function ProductionStagesTimeline({ project }: ProductionStagesTimelineProps) {
  return (
    <div className="plan-modal__stages-grid">
      {FORECAST_STAGES.map((cfg, i) => {
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