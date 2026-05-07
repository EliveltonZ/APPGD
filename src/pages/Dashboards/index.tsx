import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  LabelList,
} from "recharts";
import { Monitor, Factory, DollarSign } from "lucide-react";
import {
  DASHBOARD_RECORDS,
  DASH_AMBIENTES,
  DASH_VENDEDORES,
  DASH_LIBERADORES,
} from "../../data/dashboardMocks";
import type { DashboardRecord } from "../../data/dashboardMocks";
import "./index.css";

type Tab = "projetos" | "producao" | "financeiro";

const LOJA_COLORS: Record<number, string> = {
  420: "#3b82f6",
  421: "#f97316",
  422: "#16a34a",
};

const MONTHS_LIST = [
  "2025-01",
  "2025-02",
  "2025-03",
  "2025-04",
  "2025-05",
  "2025-06",
  "2025-07",
  "2025-08",
  "2025-09",
  "2025-10",
  "2025-11",
  "2025-12",
];

const MONTH_LABELS: Record<string, string> = {
  "2025-01": "Jan",
  "2025-02": "Fev",
  "2025-03": "Mar",
  "2025-04": "Abr",
  "2025-05": "Mai",
  "2025-06": "Jun",
  "2025-07": "Jul",
  "2025-08": "Ago",
  "2025-09": "Set",
  "2025-10": "Out",
  "2025-11": "Nov",
  "2025-12": "Dez",
};

function topKey(
  records: DashboardRecord[],
  key: "ambiente" | "vendedor" | "liberador",
): string {
  const counts = new Map<string, number>();
  for (const r of records) counts.set(r[key], (counts.get(r[key]) ?? 0) + 1);
  let best = "—",
    bestN = 0;
  for (const [k, v] of counts)
    if (v > bestN) {
      best = k;
      bestN = v;
    }
  return best;
}

const AXIS_TICK = { fontSize: 9 } as const;

export function DashboardsPrincipalPage() {
  const [tab, setTab] = useState<Tab>("projetos");
  const [dataInicio, setDataInicio] = useState("2025-01-01");
  const [dataFim, setDataFim] = useState("2025-12-31");
  const [vendedor, setVendedor] = useState("");
  const [liberador, setLiberador] = useState("");
  const [ambiente, setAmbiente] = useState("");
  const [loja, setLoja] = useState("");

  const mesInicio = dataInicio.slice(0, 7);
  const mesFim = dataFim.slice(0, 7);

  const filtered = useMemo(
    () =>
      DASHBOARD_RECORDS.filter((r) => {
        if (vendedor && r.vendedor !== vendedor) return false;
        if (liberador && r.liberador !== liberador) return false;
        if (ambiente && r.ambiente !== ambiente) return false;
        if (loja && r.loja !== Number(loja)) return false;
        if (mesInicio && r.mes < mesInicio) return false;
        if (mesFim && r.mes > mesFim) return false;
        return true;
      }),
    [vendedor, liberador, ambiente, loja, mesInicio, mesFim],
  );

  const topAmbiente = useMemo(() => topKey(filtered, "ambiente"), [filtered]);
  const topVendedor = useMemo(() => topKey(filtered, "vendedor"), [filtered]);
  const topLiberador = useMemo(() => topKey(filtered, "liberador"), [filtered]);

  const ambData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of filtered)
      counts.set(r.ambiente, (counts.get(r.ambiente) ?? 0) + 1);
    return DASH_AMBIENTES.map((a) => ({ name: a, value: counts.get(a) ?? 0 }));
  }, [filtered]);

  const vendData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of filtered)
      counts.set(r.vendedor, (counts.get(r.vendedor) ?? 0) + 1);
    return DASH_VENDEDORES.map((v) => ({ name: v, value: counts.get(v) ?? 0 }));
  }, [filtered]);

  const libData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of filtered)
      counts.set(r.liberador, (counts.get(r.liberador) ?? 0) + 1);
    return DASH_LIBERADORES.map((l) => ({
      name: l,
      value: counts.get(l) ?? 0,
    }));
  }, [filtered]);

  const lojaData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of filtered)
      counts.set(String(r.loja), (counts.get(String(r.loja)) ?? 0) + 1);
    return ([420, 421, 422] as const).map((l) => ({
      name: `Loja ${l}`,
      value: counts.get(String(l)) ?? 0,
      color: LOJA_COLORS[l],
    }));
  }, [filtered]);

  const periodoData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of filtered) counts.set(r.mes, (counts.get(r.mes) ?? 0) + 1);
    return MONTHS_LIST.map((m) => ({
      name: MONTH_LABELS[m],
      value: counts.get(m) ?? 0,
    }));
  }, [filtered]);

  const avgPeriodo = useMemo(() => {
    const nonZero = periodoData.filter((d) => d.value > 0);
    return nonZero.length
      ? Math.round(nonZero.reduce((s, d) => s + d.value, 0) / nonZero.length)
      : 0;
  }, [periodoData]);

  const avgLib = useMemo(() => {
    const nonZero = libData.filter((d) => d.value > 0);
    return nonZero.length
      ? Math.round(nonZero.reduce((s, d) => s + d.value, 0) / nonZero.length)
      : 0;
  }, [libData]);

  function handleClear() {
    setDataInicio("2025-01-01");
    setDataFim("2025-12-31");
    setVendedor("");
    setLiberador("");
    setAmbiente("");
    setLoja("");
  }

  const TABS = [
    { id: "projetos" as Tab, label: "Projetos", icon: <Monitor size={14} /> },
    { id: "producao" as Tab, label: "Produção", icon: <Factory size={14} /> },
    {
      id: "financeiro" as Tab,
      label: "Financeiro",
      icon: <DollarSign size={14} />,
    },
  ];

  return (
    <div className="proj-dash">
      {/* ── Left panel ── */}
      <div className="proj-dash__panel">
        <div className="proj-dash__brand">
          <span className="proj-dash__brand-text">GD</span>
          <span className="proj-dash__brand-label">Dashboard</span>
        </div>

        <div className="proj-dash__tabs">
          {TABS.map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              className={`proj-dash__tab${tab === id ? " proj-dash__tab--active" : ""}`}
              onClick={() => setTab(id)}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        <div className="proj-dash__filters">
          <div className="proj-dash__filter-group">
            <label className="proj-dash__filter-label">Data de Início</label>
            <input
              type="date"
              className="proj-dash__input"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>

          <div className="proj-dash__filter-group">
            <label className="proj-dash__filter-label">Data de Fim</label>
            <input
              type="date"
              className="proj-dash__input"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>

          <div className="proj-dash__filter-group">
            <label className="proj-dash__filter-label">Vendedores</label>
            <select
              className="proj-dash__select"
              value={vendedor}
              onChange={(e) => setVendedor(e.target.value)}
            >
              <option value="">Selecione um Vendedor</option>
              {DASH_VENDEDORES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div className="proj-dash__filter-group">
            <label className="proj-dash__filter-label">Liberadores</label>
            <select
              className="proj-dash__select"
              value={liberador}
              onChange={(e) => setLiberador(e.target.value)}
            >
              <option value="">Selecione um Liberador</option>
              {DASH_LIBERADORES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div className="proj-dash__filter-group">
            <label className="proj-dash__filter-label">Ambiente</label>
            <select
              className="proj-dash__select"
              value={ambiente}
              onChange={(e) => setAmbiente(e.target.value)}
            >
              <option value="">Selecione um Ambiente</option>
              {DASH_AMBIENTES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div className="proj-dash__filter-group">
            <label className="proj-dash__filter-label">Loja</label>
            <select
              className="proj-dash__select"
              value={loja}
              onChange={(e) => setLoja(e.target.value)}
            >
              <option value="">Selecione uma Loja</option>
              {([420, 421, 422] as const).map((l) => (
                <option key={l} value={l}>
                  Loja {l}
                </option>
              ))}
            </select>
          </div>

          <div className="proj-dash__filter-actions">
            <button
              type="button"
              className="proj-dash__btn proj-dash__btn--secondary"
              onClick={handleClear}
            >
              Filtrar
            </button>
            <button
              type="button"
              className="proj-dash__btn proj-dash__btn--primary"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="proj-dash__main">
        {/* KPI cards */}
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
            <span className="proj-kpi__label">
              Total de Projetos no Período
            </span>
            <span className="proj-kpi__value">{filtered.length}</span>
          </div>
        </div>

        {/* Charts */}
        <div className="proj-dash__charts">
          {/* Row 1: Ambientes + Vendedores */}
          <div className="proj-dash__row">
            <div className="proj-chart">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={ambData}
                  // margin={{ top: 18, right: 8, left: 20, bottom: 90 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{
                      ...AXIS_TICK,
                      angle: -90,
                      textAnchor: "end",
                      dx: -2,
                    }}
                    interval={0}
                    height={90}
                  />
                  <YAxis
                    tick={AXIS_TICK}
                    label={{
                      value: "Total",
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: 9 },
                    }}
                  />
                  <Tooltip
                    formatter={(v) => [String(v ?? 0), "Qtd"]}
                    contentStyle={{ fontSize: 11 }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#3b82f6"
                    radius={[2, 2, 0, 0]}
                    maxBarSize={28}
                  >
                    <LabelList
                      dataKey="value"
                      position="top"
                      style={{ fontSize: 8, fill: "var(--text-h)" }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="proj-chart__axis-label">Ambientes</p>
            </div>

            <div className="proj-chart">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={vendData}
                  // margin={{ top: 18, right: 8, left: 20, bottom: 90 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{
                      ...AXIS_TICK,
                      angle: -90,
                      textAnchor: "end",
                      dx: -2,
                    }}
                    interval={0}
                    height={90}
                  />
                  <YAxis
                    tick={AXIS_TICK}
                    label={{
                      value: "Total",
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: 9 },
                    }}
                  />
                  <Tooltip
                    formatter={(v) => [String(v ?? 0), "Qtd"]}
                    contentStyle={{ fontSize: 11 }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#f97316"
                    radius={[2, 2, 0, 0]}
                    maxBarSize={28}
                  >
                    <LabelList
                      dataKey="value"
                      position="top"
                      style={{ fontSize: 8, fill: "var(--text-h)" }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="proj-chart__axis-label">Vendedor</p>
            </div>
          </div>

          {/* Row 2: Liberador + Lojas donut + Período */}
          <div className="proj-dash__row proj-dash__row--3">
            <div className="proj-chart">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={libData}
                  // margin={{ top: 18, right: 8, left: 20, bottom: 90 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{
                      ...AXIS_TICK,
                      angle: -90,
                      textAnchor: "end",
                      dx: -2,
                    }}
                    interval={0}
                    height={90}
                  />
                  <YAxis
                    tick={AXIS_TICK}
                    label={{
                      value: "Total",
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: 9 },
                    }}
                  />
                  <Tooltip
                    formatter={(v) => [String(v ?? 0), "Qtd"]}
                    contentStyle={{ fontSize: 11 }}
                  />
                  <ReferenceLine
                    y={avgLib}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                  />
                  <Bar
                    dataKey="value"
                    fill="#16a34a"
                    radius={[2, 2, 0, 0]}
                    maxBarSize={28}
                  >
                    <LabelList
                      dataKey="value"
                      position="top"
                      style={{ fontSize: 8, fill: "var(--text-h)" }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="proj-chart__axis-label">Liberador</p>
            </div>

            <div className="proj-chart proj-chart--center">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={lojaData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                    label={({ value }) => value}
                    labelLine={false}
                  >
                    {lojaData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => [String(v ?? 0), "Qtd"]}
                    contentStyle={{ fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="proj-chart">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart
                  data={periodoData}
                  margin={{ top: 18, right: 8, left: 20, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={AXIS_TICK} />
                  <YAxis
                    tick={AXIS_TICK}
                    label={{
                      value: "Total",
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: 9 },
                    }}
                  />
                  <Tooltip
                    formatter={(v) => [String(v ?? 0), "Qtd"]}
                    contentStyle={{ fontSize: 11 }}
                  />
                  <ReferenceLine
                    y={avgPeriodo}
                    stroke="#eab308"
                    strokeDasharray="4 4"
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#dc2626"
                    fill="rgba(220,38,38,0.25)"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#dc2626" }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <p className="proj-chart__axis-label">Período</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
