import { ChartBar, ChartArea, ChartDonut } from "../../../components/Charts";
import { useProjectos } from "./context";

export function ProjetosCharts() {
  const {
    totalFiltrado, topAmbiente, topVendedor, topLiberador,
    ambData, vendData, libData, lojaData, periodoData,
    avgPeriodo, avgLib,
    crossFilter, handleBarClick,
  } = useProjectos();

  const rotatedCat = { angle: -90, textAnchor: "end" as const, dx: -2 };
  const rotatedAxis = { interval: 0, height: 90 };

  return (
    <>
      <div className="proj-dash__kpis">
        <div className="proj-kpi">
          <span className="proj-kpi__label">Ambiente mais Vendido</span>
          <span className="proj-kpi__value">{topAmbiente}</span>
        </div>
        <div className="proj-kpi">
          <span className="proj-kpi__label">Vendedor com Mais Pedido</span>
          <span className="proj-kpi__value">{topVendedor}</span>
        </div>
        <div className="proj-kpi">
          <span className="proj-kpi__label">Liberador com Mais Pedido</span>
          <span className="proj-kpi__value">{topLiberador}</span>
        </div>
        <div className="proj-kpi">
          <span className="proj-kpi__label">Total de Projetos no Período</span>
          <span className="proj-kpi__value">{totalFiltrado}</span>
        </div>
      </div>

      <div className="proj-dash__charts">
        {/* ── Linha 1 ─────────────────────────────────────────── */}
        <div className="proj-dash__row">
          <div className="proj-chart">
            <ChartBar
              axisLabel="Ambientes"
              data={ambData}
              xKey="name"
              height={260}
              catTickProps={rotatedCat}
              catAxisProps={rotatedAxis}
              selectedValue={crossFilter?.dim === 'ambiente' ? crossFilter.value : undefined}
              onBarClick={(v) => handleBarClick('ambiente', v)}
              series={[{
                dataKey:    "value",
                label:      "Qtd",
                showLabels: true,
                radius:     [4, 4, 0, 0],
                gradient:   { color: "#3b82f6", fromOpacity: 1, toOpacity: 0.25 },
              }]}
            />
          </div>

          <div className="proj-chart">
            <ChartBar
              axisLabel="Vendedor"
              data={vendData}
              xKey="name"
              height={260}
              catTickProps={rotatedCat}
              catAxisProps={rotatedAxis}
              selectedValue={crossFilter?.dim === 'vendedor' ? crossFilter.value : undefined}
              onBarClick={(v) => handleBarClick('vendedor', v)}
              series={[{
                dataKey:    "value",
                label:      "Qtd",
                showLabels: true,
                radius:     [4, 4, 0, 0],
                gradient:   { color: "#f97316", fromOpacity: 1, toOpacity: 0.25 },
              }]}
            />
          </div>
        </div>

        {/* ── Linha 2 ─────────────────────────────────────────── */}
        <div className="proj-dash__row proj-dash__row--3">
          <div className="proj-chart">
            <ChartBar
              axisLabel="Liberador"
              data={libData}
              xKey="name"
              height={240}
              catTickProps={rotatedCat}
              catAxisProps={rotatedAxis}
              referenceLines={[{ y: avgLib, color: "#ef4444" }]}
              selectedValue={crossFilter?.dim === 'liberador' ? crossFilter.value : undefined}
              onBarClick={(v) => handleBarClick('liberador', v)}
              series={[{
                dataKey:    "value",
                label:      "Qtd",
                showLabels: true,
                radius:     [4, 4, 0, 0],
                gradient:   { color: "#16a34a", fromOpacity: 1, toOpacity: 0.25 },
              }]}
            />
          </div>

          <div className="proj-chart proj-chart--center">
            <ChartDonut
              data={lojaData}
              height={240}
              innerRadius={55}
              outerRadius={90}
              labelFormat={(e) => String(e.value)}
            />
          </div>

          <div className="proj-chart">
            <ChartArea
              axisLabel="Período"
              data={periodoData}
              xKey="name"
              height={240}
              referenceLines={[{ y: avgPeriodo, color: "#eab308" }]}
              series={[{
                dataKey:  "value",
                label:    "Qtd",
                color:    "#dc2626",
                gradient: { fromOpacity: 0.5, toOpacity: 0.04 },
              }]}
            />
          </div>
        </div>
      </div>
    </>
  );
}
