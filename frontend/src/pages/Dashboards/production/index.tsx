import { useProductionDashboard } from "./ProductionProvider";
import { GraphBar } from "../../../components/Charts/Bar";
import { useMemo } from "react";
import { countBy } from "../utils";
import { GraphPie } from "../../../components/Charts/Pie";

const COLORS: Record<string, string> = {
  "A VENCER": "#3b82f6",
  ATRASADO:   "#f97316",
  INICIADO:   "#16a34a",
  PENDENCIA:  "#bd1111",
};

export function ProductionDashboardsPage() {
  const { filtered, DASH_STATUS } = useProductionDashboard();

  const stData = useMemo(() => {
    const counts = countBy(filtered, "status");
    return DASH_STATUS.map((s) => ({
      name: s,
      value: counts.get(s) ?? 0,
      color: COLORS[s],
    }));
  }, [filtered, DASH_STATUS]);

  return (
    <div className="proj-dash__main">
      <div className="proj-dash__row">
        <div className="proj-chart">
          <GraphPie data={stData} />
          <p className="proj-chart__axis-label">Distribuição por Status</p>
        </div>

        <div className="proj-chart">
          <GraphBar data={stData} color="#3b82f6" />
          <p className="proj-chart__axis-label">Status de Produção por etapa</p>
        </div>
      </div>
    </div>
  );
}
