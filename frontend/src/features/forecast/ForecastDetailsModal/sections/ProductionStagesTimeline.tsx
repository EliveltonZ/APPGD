import { ProductionStageCard } from '../../../../components/ProductionStageCard';
import { FORECAST_DETAIL_STAGES } from '../../../../data/forecastConfig';
import type { ForecastProjectDetail, ForecastProjectDetailStages } from '../../../../types/forecast';

interface ProductionStagesTimelineProps {
  detail: ForecastProjectDetail;
}

export function ProductionStagesTimeline({ detail }: ProductionStagesTimelineProps) {
  return (
    <div className="plan-modal__stages-grid">
      {FORECAST_DETAIL_STAGES.map((cfg, i) => {
        const s = detail.stages[cfg.id as keyof ForecastProjectDetailStages];
        return (
          <ProductionStageCard
            key={cfg.id}
            index={i + 1}
            label={cfg.label}
            status={s.status}
            inicio={s.inicio}
            fim={s.fim}
            responsavel={s.responsavel}
          />
        );
      })}
    </div>
  );
}
