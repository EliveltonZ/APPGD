import { ChartBar, ChartArea, ChartDonut } from "../../../components/Charts";
import { useParadas } from "./paradasContext";

export function ParadasCharts() {
  const {
    totalParadas, tempoTotalHoras, totalAbertas, topMaquina, topTipo,
    porTipo, porMaquina, porMesFormatted,
    stackedData, stackedSeries,
    maquinaFilter, handleMaquinaClick,
  } = useParadas();

  return (
    <>
      {/* ── KPIs ──────────────────────────────────────────── */}
      <div className="proj-dash__kpis">
        <div className="proj-kpi">
          <span className="proj-kpi__label">Total de Paradas</span>
          <span className="proj-kpi__value">{totalParadas}</span>
        </div>
        <div className="proj-kpi">
          <span className="proj-kpi__label">Horas Paradas</span>
          <span className="proj-kpi__value">{tempoTotalHoras > 0 ? `${tempoTotalHoras}h` : "—"}</span>
        </div>
        <div className="proj-kpi">
          <span className="proj-kpi__label">Máquina que Mais Parou</span>
          <span className="proj-kpi__value">{topMaquina}</span>
        </div>
        <div className="proj-kpi">
          <span className="proj-kpi__label">Motivo Mais Frequente</span>
          <span className="proj-kpi__value">{topTipo}</span>
        </div>
      </div>

      <div className="proj-dash__charts">
        {/* ── Linha 1: donut motivos + bar ranking máquinas ── */}
        <div className="proj-dash__row">
          <div className="proj-chart proj-chart--center">
            <ChartDonut
              title="Distribuição por Motivo"
              data={porTipo.map(d => ({ name: d.name, value: d.value }))}
              height={260}
              innerRadius={60}
              outerRadius={100}
              labelFormat={(e) => `${e.name} (${e.value})`}
            />
          </div>

          <div className="proj-chart">
            <ChartBar
              title="Ranking de Paradas por Máquina"
              axisLabel="Número de paradas no período"
              data={porMaquina}
              xKey="name"
              variant="bar"
              height={260}
              showLabels
              selectedValue={maquinaFilter ?? undefined}
              onBarClick={handleMaquinaClick}
              series={[{
                dataKey:    "value",
                label:      "Paradas",
                showLabels: true,
                radius:     [0, 4, 4, 0],
                gradient:   { color: "#2a78d6", fromOpacity: 1, toOpacity: 0.3 },
              }]}
            />
          </div>
        </div>

        {/* ── Linha 2: evolução mensal (área) ─────────────── */}
        <div className="proj-dash__row proj-dash__row--full">
          <div className="proj-chart">
            <ChartArea
              title="Evolução Mensal de Paradas"
              axisLabel="Número de paradas por mês"
              data={porMesFormatted}
              xKey="label"
              height={220}
              series={[{
                dataKey:  "total",
                label:    "Paradas",
                color:    "#eb6834",
                gradient: { fromOpacity: 0.5, toOpacity: 0.03 },
              }]}
            />
          </div>
        </div>

        {/* ── Linha 3: horas paradas por máquina/mês (stacked) */}
        <div className="proj-dash__row proj-dash__row--full">
          <div className="proj-chart">
            <ChartBar
              title="Horas Paradas por Máquina / Mês"
              axisLabel="Horas acumuladas de parada por máquina em cada mês"
              data={stackedData}
              xKey="label"
              height={240}
              yUnit="h"
              series={stackedSeries}
            />
          </div>
        </div>
      </div>
    </>
  );
}
