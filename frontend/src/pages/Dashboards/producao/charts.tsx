import { ChartBar, ChartArea, ChartDonut } from "../../../components/Charts";
import { useProducao } from "./context";
import { ParadasCharts } from "./paradasCharts";

export type ProducaoSubTab = "geral" | "nova";

const SUBTABS: { id: ProducaoSubTab; label: string }[] = [
  { id: "geral", label: "Visão Geral" },
  { id: "nova",  label: "Análise Detalhada" },
];

const STATUS_COLORS: Record<string, string> = {
  AGUARDANDO: "var(--aguardando)",
  INICIADO:   "var(--iniciado)",
  "A VENCER": "var(--a-vencer)",
  ATRASADO:   "var(--atrasado)",
  URGENTE:    "var(--urgente)",
  PENDENCIA:  "var(--pendencia)",
  PARCEADO:   "var(--parceado)",
  PRONTO:     "var(--pronto)",
};

interface Props {
  subtab: ProducaoSubTab;
  onSubtabChange: (v: ProducaoSubTab) => void;
}

export function ProducaoCharts({ subtab, onSubtabChange }: Props) {

  const {
    totalEmProd, urgentesEmProd,
    avgLeadTime, pctNoPrazo,
    filteredStatusDist, esteiraViva, etapaTempos,
    leadTimeFiltered, onTimeFiltered,
    liveFilter, histFilter,
    handleLiveClick, handleHistClick,
  } = useProducao();

  return (
    <>
      {/* Sub-tabs */}
      <div className="proj-dash__subtabs">
        {SUBTABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`proj-dash__subtab${subtab === id ? " proj-dash__subtab--active" : ""}`}
            onClick={() => onSubtabChange(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {subtab === "nova" && <ParadasCharts />}

      {subtab === "geral" && <>
      {/* KPIs */}
      <div className="proj-dash__kpis">
        <div className="proj-kpi">
          <span className="proj-kpi__label">Em Produção Agora</span>
          <span className="proj-kpi__value">{totalEmProd}</span>
        </div>
        <div className="proj-kpi">
          <span className="proj-kpi__label">Urgentes</span>
          <span
            className="proj-kpi__value"
            style={{ color: totalEmProd > 0 && urgentesEmProd > 0 ? "#f97316" : undefined }}
          >
            {urgentesEmProd}
          </span>
        </div>
        <div className="proj-kpi">
          <span className="proj-kpi__label">Lead Time Médio (período)</span>
          <span className="proj-kpi__value">
            {avgLeadTime > 0 ? `${avgLeadTime} dias` : "—"}
          </span>
        </div>
        <div className="proj-kpi">
          <span className="proj-kpi__label">No Prazo (período)</span>
          <span
            className="proj-kpi__value"
            style={{
              color: pctNoPrazo >= 80 ? "#16a34a" : pctNoPrazo >= 60 ? "#eab308" : "#ef4444",
            }}
          >
            {pctNoPrazo > 0 ? `${pctNoPrazo}%` : "—"}
          </span>
        </div>
      </div>

      <div className="proj-dash__charts">
        {/* ── Linha 1: tempo real ──────────────────────────────── */}
        <div className="proj-dash__row proj-dash__row--3-equal">
          <div className="proj-chart proj-chart--center">
            <ChartDonut
              title={liveFilter ? `Status — ${liveFilter}` : "Status Atual"}
              data={filteredStatusDist.map((d) => ({
                ...d,
                color: STATUS_COLORS[d.name] ?? "#64748b",
              }))}
              height={240}
              innerRadius={55}
              outerRadius={90}
              labelFormat={(e) => `${e.name} (${e.value})`}
            />
          </div>

          <div className="proj-chart">
            <ChartBar
              title="Esteira ao Vivo"
              axisLabel="Projetos em cada etapa agora"
              data={esteiraViva}
              xKey="name"
              height={240}
              catTickProps={{ angle: -30, textAnchor: "end", dx: -2 }}
              margin={{ top: 16, right: 8, left: 0, bottom: 60 }}
              selectedValue={liveFilter ?? undefined}
              onBarClick={handleLiveClick}
              series={[
                {
                  dataKey:  "iniciado",
                  label:    "Iniciado",
                  stackId:  "e",
                  radius:   [0, 0, 0, 0],
                  gradient: { color: "#eab308", fromOpacity: 1, toOpacity: 0.4 },
                },
                {
                  dataKey:  "finalizado",
                  label:    "Finalizado",
                  stackId:  "e",
                  radius:   [0, 0, 0, 0],
                  gradient: { color: "#16a34a", fromOpacity: 1, toOpacity: 0.4 },
                },
                {
                  dataKey:    "aguardando",
                  label:      "Aguardando",
                  stackId:    "e",
                  radius:     [4, 4, 0, 0],
                  gradient:   { color: "#ef4444", fromOpacity: 1, toOpacity: 0.35 },
                  minPointSize: 3,
                },
              ]}
            />
          </div>

          <div className="proj-chart">
            <ChartBar
              title="Tempo Médio por Etapa (horas)"
              axisLabel="Média histórica (projetos concluídos)"
              data={etapaTempos}
              xKey="name"
              variant="bar"
              height={240}
              xUnit="h"
              selectedValue={liveFilter ?? undefined}
              onBarClick={handleLiveClick}
              series={[
                {
                  dataKey:    "value",
                  label:      "Tempo médio",
                  radius:     [0, 4, 4, 0],
                  showLabels: true,
                  gradient:   { color: "#f97316", fromOpacity: 1, toOpacity: 0.3 },
                },
              ]}
            />
          </div>
        </div>

        {/* ── Linha 2: pontualidade (largura total) ────────────── */}
        <div className="proj-dash__row proj-dash__row--full">
          <div className="proj-chart">
            <ChartBar
              title="Pontualidade de Entrega"
              axisLabel="Mês de conclusão (pronto)"
              data={onTimeFiltered}
              xKey="label"
              height={220}
              selectedValue={histFilter ?? undefined}
              onBarClick={handleHistClick}
              series={[
                {
                  dataKey: "noPrazo",
                  label:   "No Prazo",
                  stackId: "a",
                  radius:  [0, 0, 0, 0],
                  gradient: { color: "#16a34a", fromOpacity: 1, toOpacity: 0.35 },
                },
                {
                  dataKey: "atrasado",
                  label:   "Atrasado",
                  stackId: "a",
                  radius:  [4, 4, 0, 0],
                  gradient: { color: "#ef4444", fromOpacity: 1, toOpacity: 0.35 },
                },
              ]}
            />
          </div>
        </div>

        {/* ── Linha 3: Lead time (largura total) ──────────────── */}
        <div className="proj-dash__row proj-dash__row--full">
          <div className="proj-chart">
            <ChartArea
              title="Lead Time de Produção por Mês (dias)"
              axisLabel="Média de dias entre chegada na fábrica e conclusão"
              data={leadTimeFiltered}
              xKey="label"
              height={220}
              yUnit=" d"
              selectedValue={histFilter ?? undefined}
              onAreaClick={handleHistClick}
              series={[
                {
                  dataKey:  "avgDias",
                  label:    "Lead Time Médio",
                  color:    "#f97316",
                  gradient: { fromOpacity: 0.5, toOpacity: 0.02 },
                },
              ]}
            />
          </div>
        </div>
      </div>
      </>}
    </>
  );
}
