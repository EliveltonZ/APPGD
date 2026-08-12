import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { fetchDashParadas, type ParadasDashboard } from "../../../services/dashboard";
import { getPreferencias, setPreferencias } from "../../../services/preferencias";
import { fmtMes } from "./context";
import { SERIES_COLORS } from "../../../components/Charts";
import type { BarSeriesConfig } from "../../../components/Charts";

const DEFAULT_INICIO = "2024-01-01";
const DEFAULT_FIM    = new Date().toISOString().slice(0, 10);
const PREF_START = "paradas_dash_start";
const PREF_END   = "paradas_dash_end";

const EMPTY: ParadasDashboard = {
  totalParadas: 0, tempoTotalHoras: 0, totalAbertas: 0,
  porTipo: [], porMaquina: [], porMes: [], porMaquinaMes: [],
};

interface ParadasContextValue {
  startDate: string; setStartDate: (v: string) => void;
  endDate:   string; setEndDate:   (v: string) => void;
  handleApply: () => void;
  handleClear: () => void;

  // KPIs
  totalParadas:    number;
  tempoTotalHoras: number;
  totalAbertas:    number;
  topMaquina:      string;
  topTipo:         string;

  // Gráfico 1 — donut por tipo
  porTipo: { name: string; value: number; horas: number }[];

  // Gráfico 2 — bar horizontal por máquina (frequência)
  porMaquina: { name: string; value: number; horas: number }[];

  // Gráfico 3 — area evolução mensal
  porMesFormatted: { mes: string; label: string; total: number; horas: number }[];

  // Gráfico 4 — stacked bar máquina × mês
  stackedData:    Record<string, unknown>[];
  stackedSeries:  BarSeriesConfig[];

  // Cross-filter por máquina
  maquinaFilter:     string | null;
  handleMaquinaClick: (value: string) => void;
}

const ParadasContext = createContext<ParadasContextValue | null>(null);

export function ParadasProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ParadasDashboard>(EMPTY);

  const [startDate,    setStartDate]    = useState(DEFAULT_INICIO);
  const [endDate,      setEndDate]      = useState(DEFAULT_FIM);
  const [appliedStart, setAppliedStart] = useState(DEFAULT_INICIO);
  const [appliedEnd,   setAppliedEnd]   = useState(DEFAULT_FIM);
  const [maquinaFilter, setMaquinaFilter] = useState<string | null>(null);

  function handleMaquinaClick(value: string) {
    setMaquinaFilter(prev => (prev === value || !value) ? null : value);
  }

  useEffect(() => {
    getPreferencias([PREF_START, PREF_END]).then(prefs => {
      const s = prefs[PREF_START] ?? DEFAULT_INICIO;
      const e = prefs[PREF_END]   ?? DEFAULT_FIM;
      setStartDate(s); setEndDate(e);
      setAppliedStart(s); setAppliedEnd(e);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetchDashParadas(appliedStart, appliedEnd).then(setData).catch(() => {});
  }, [appliedStart, appliedEnd]);

  const porMesFormatted = useMemo(() =>
    data.porMes.map(r => ({ ...r, label: fmtMes(r.mes) })),
    [data.porMes],
  );

  // Pivô: [{mes, maquina, horas}] → [{label, [maq1]: h, [maq2]: h, ...}]
  const { stackedData, stackedSeries } = useMemo(() => {
    const maquinas = [...new Set(data.porMaquinaMes.map(r => r.maquina))];
    const byMes: Record<string, Record<string, number>> = {};
    for (const r of data.porMaquinaMes) {
      byMes[r.mes] = byMes[r.mes] ?? {};
      byMes[r.mes][r.maquina] = Number(r.horas);
    }
    const rows = Object.entries(byMes)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mes, vals]) => ({ mes, label: fmtMes(mes), ...vals }));

    const series: BarSeriesConfig[] = maquinas.map((m, i) => ({
      dataKey:  m,
      label:    m,
      stackId:  "p",
      radius:   [0, 0, 0, 0],
      gradient: { color: SERIES_COLORS[i % SERIES_COLORS.length], fromOpacity: 1, toOpacity: 0.4 },
    }));

    return { stackedData: rows as Record<string, unknown>[], stackedSeries: series };
  }, [data.porMaquinaMes]);

  function handleApply() {
    setAppliedStart(startDate); setAppliedEnd(endDate);
    setPreferencias({ [PREF_START]: startDate, [PREF_END]: endDate }).catch(() => {});
  }
  function handleClear() {
    setStartDate(DEFAULT_INICIO); setEndDate(DEFAULT_FIM);
    setAppliedStart(DEFAULT_INICIO); setAppliedEnd(DEFAULT_FIM);
    setMaquinaFilter(null);
    setPreferencias({ [PREF_START]: DEFAULT_INICIO, [PREF_END]: DEFAULT_FIM }).catch(() => {});
  }

  return (
    <ParadasContext.Provider value={{
      startDate, setStartDate, endDate, setEndDate,
      handleApply, handleClear,
      totalParadas:    data.totalParadas,
      tempoTotalHoras: data.tempoTotalHoras,
      totalAbertas:    data.totalAbertas,
      topMaquina:      data.porMaquina[0]?.name ?? "—",
      topTipo:         data.porTipo[0]?.name    ?? "—",
      porTipo:         data.porTipo,
      porMaquina:      data.porMaquina,
      porMesFormatted,
      stackedData,
      stackedSeries,
      maquinaFilter,
      handleMaquinaClick,
    }}>
      {children}
    </ParadasContext.Provider>
  );
}

export function useParadas() {
  const ctx = useContext(ParadasContext);
  if (!ctx) throw new Error("useParadas deve ser usado dentro de ParadasProvider");
  return ctx;
}
