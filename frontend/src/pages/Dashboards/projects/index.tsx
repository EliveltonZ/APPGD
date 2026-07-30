import { GraphPie } from "../../../components/Charts/Pie";
import { GraphArea } from "../../../components/Charts/Area";
import { GraphBar } from "../../../components/Charts/Bar";
import { Metric } from "../../../components/Charts/Metrics";
import { useMemo } from "react";
import { useProjectsDashboard } from "./ProjectsProvider";
import { countBy, topKey } from "../utils";

const PT_MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function buildMonths(inicio: string, fim: string): string[] {
  const months: string[] = [];
  let [y, m] = inicio.slice(0, 7).split("-").map(Number);
  const [ey, em] = fim.slice(0, 7).split("-").map(Number);
  while (y < ey || (y === ey && m <= em)) {
    months.push(`${y}-${String(m).padStart(2, "0")}`);
    m++;
    if (m > 12) { m = 1; y++; }
  }
  return months;
}

const LOJA_PALETTE = ["#3b82f6","#f97316","#16a34a","#a855f7","#ef4444","#eab308"];

export function ProjectsDashboardsPage() {
  const {
    filtered,
    DASH_AMBIENTES,
    DASH_VENDEDORES,
    DASH_LIBERADORES,
    DASH_LOJAS,
    dataInicio,
    dataFim,
  } = useProjectsDashboard();

  const topAmbiente  = useMemo(() => topKey(filtered, "ambiente"),  [filtered]);
  const topVendedor  = useMemo(() => topKey(filtered, "vendedor"),  [filtered]);
  const topLiberador = useMemo(() => topKey(filtered, "liberador"), [filtered]);

  const ambData = useMemo(() => {
    const counts = countBy(filtered, "ambiente");
    return DASH_AMBIENTES.map((a) => ({ name: a, value: counts.get(a) ?? 0 }));
  }, [filtered, DASH_AMBIENTES]);

  const vendData = useMemo(() => {
    const counts = countBy(filtered, "vendedor");
    return DASH_VENDEDORES.map((v) => ({ name: v, value: counts.get(v) ?? 0 }));
  }, [filtered, DASH_VENDEDORES]);

  const libData = useMemo(() => {
    const counts = countBy(filtered, "liberador");
    return DASH_LIBERADORES.map((l) => ({ name: l, value: counts.get(l) ?? 0 }));
  }, [filtered, DASH_LIBERADORES]);

  const lojaData = useMemo(() => {
    const counts = countBy(filtered, "loja");
    return DASH_LOJAS.map(({ id, nome }, i) => ({
      name:  nome,
      value: counts.get(String(id)) ?? 0,
      color: LOJA_PALETTE[i % LOJA_PALETTE.length],
    }));
  }, [filtered, DASH_LOJAS]);

  const months = useMemo(() => buildMonths(dataInicio, dataFim), [dataInicio, dataFim]);

  const periodoData = useMemo(() => {
    const counts = countBy(filtered, "mes");
    return months.map((m) => ({
      name:  PT_MONTHS[Number(m.slice(5)) - 1],
      value: counts.get(m) ?? 0,
    }));
  }, [filtered, months]);

  const avgPeriodo = useMemo(() => {
    const nonZero = periodoData.filter((d) => d.value > 0);
    return nonZero.length
      ? Math.round(nonZero.reduce((s, d) => s + d.value, 0) / nonZero.length)
      : 0;
  }, [periodoData]);

  return (
    <div className="proj-dash__main">
      <div className="proj-dash__kpis">
        <Metric label="Ambiente mais Vendido"       value={topAmbiente}    />
        <Metric label="Vendedor com Mais Pedido"    value={topVendedor}    />
        <Metric label="Liberador com Mais Pedido"   value={topLiberador}   />
        <Metric label="Total de Projetos no Período" value={filtered.length} />
      </div>

      <div className="proj-dash__charts">
        <div className="proj-dash__row">
          <div className="proj-chart">
            <GraphBar data={ambData} color="#3b82f6" />
            <p className="proj-chart__axis-label">Ambientes</p>
          </div>
          <div className="proj-chart">
            <GraphBar data={vendData} color="#f97316" />
            <p className="proj-chart__axis-label">Vendedor</p>
          </div>
        </div>

        <div className="proj-dash__row proj-dash__row--3">
          <div className="proj-chart">
            <GraphBar data={libData} color="#ef4444" />
            <p className="proj-chart__axis-label">Liberador</p>
          </div>
          <div className="proj-chart proj-chart--center">
            <GraphPie data={lojaData} />
          </div>
          <div className="proj-chart">
            <GraphArea data={periodoData} avg={avgPeriodo} />
            <p className="proj-chart__axis-label">Período</p>
          </div>
        </div>
      </div>
    </div>
  );
}
