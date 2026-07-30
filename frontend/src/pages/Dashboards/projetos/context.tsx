import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { fetchDashProjetos, type DashboardRecord } from "../../../services/dashboard";
import { getPreferencias, setPreferencias } from "../../../services/preferencias";

const DEFAULT_INICIO = "2024-01-01";
const DEFAULT_FIM    = new Date().toISOString().slice(0, 10);

const PREF_START = "dash_start";
const PREF_END   = "dash_end";

interface LojaOption { id: number; nome: string }

interface ChartItem { name: string; value: number }
interface LojaItem  { name: string; value: number; color: string }

type CrossDim = 'ambiente' | 'vendedor' | 'liberador'

interface CrossFilter { dim: CrossDim; value: string }

interface ProjetosContextValue {
  // inputs (não filtram até clicar Filtrar)
  startDate: string; setStartDate: (v: string) => void;
  endDate:   string; setEndDate:   (v: string) => void;
  // filtros de dimensão (filtram imediatamente)
  vendedor:  string; setVendedor:  (v: string) => void;
  liberador: string; setLiberador: (v: string) => void;
  ambiente:  string; setAmbiente:  (v: string) => void;
  loja:      string; setLoja:      (v: string) => void;
  // opções de dropdown (derivadas do período aplicado)
  DASH_VENDEDORES:  string[];
  DASH_LIBERADORES: string[];
  DASH_AMBIENTES:   string[];
  DASH_LOJAS:       LojaOption[];
  // dados dos gráficos
  totalFiltrado: number;
  topAmbiente:   string;
  topVendedor:   string;
  topLiberador:  string;
  ambData:    ChartItem[];
  vendData:   ChartItem[];
  libData:    ChartItem[];
  lojaData:   LojaItem[];
  periodoData: ChartItem[];
  avgPeriodo: number;
  avgLib:     number;
  // cross-filter (clique nas barras)
  crossFilter: CrossFilter | null;
  handleBarClick: (dim: CrossDim, value: string) => void;
  // ações
  handleApply: () => void;
  handleClear: () => void;
}

const ProjetosContext = createContext<ProjetosContextValue | null>(null);

const PT_MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const LOJA_PALETTE = ["#3b82f6","#f97316","#16a34a","#a855f7","#ef4444","#eab308"];

function topKey(records: DashboardRecord[], key: keyof DashboardRecord): string {
  const counts = new Map<string, number>();
  for (const r of records) {
    const v = String(r[key] ?? "");
    if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  let best = "—", bestN = 0;
  for (const [k, v] of counts) if (v > bestN) { best = k; bestN = v; }
  return best;
}

export function ProjetosProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<DashboardRecord[]>([]);

  const [startDate, setStartDate] = useState(DEFAULT_INICIO);
  const [endDate,   setEndDate]   = useState(DEFAULT_FIM);
  const [appliedStart, setAppliedStart] = useState(DEFAULT_INICIO);
  const [appliedEnd,   setAppliedEnd]   = useState(DEFAULT_FIM);

  const [vendedor,  setVendedor]  = useState("");
  const [liberador, setLiberador] = useState("");
  const [ambiente,  setAmbiente]  = useState("");
  const [loja,      setLoja]      = useState("");

  const [crossFilter, setCrossFilter] = useState<CrossFilter | null>(null);

  function handleBarClick(dim: CrossDim, value: string) {
    setCrossFilter(prev =>
      prev?.dim === dim && prev.value === value ? null : (value ? { dim, value } : null)
    );
  }

  useEffect(() => {
    fetchDashProjetos().then(setRecords).catch(() => {});
  }, []);

  useEffect(() => {
    getPreferencias([PREF_START, PREF_END]).then(prefs => {
      const s = prefs[PREF_START] ?? DEFAULT_INICIO;
      const e = prefs[PREF_END]   ?? DEFAULT_FIM;
      setStartDate(s); setEndDate(e);
      setAppliedStart(s); setAppliedEnd(e);
    }).catch(() => {});
  }, []);

  const filtered = useMemo(
    () => records.filter((r) => {
      if (appliedStart && r.pronto < appliedStart)    return false;
      if (appliedEnd   && r.pronto > appliedEnd)      return false;
      if (vendedor  && r.vendedor  !== vendedor)      return false;
      if (liberador && r.liberador !== liberador)     return false;
      if (ambiente  && r.ambiente  !== ambiente)      return false;
      if (loja      && r.loja !== Number(loja))       return false;
      return true;
    }),
    [records, appliedStart, appliedEnd, vendedor, liberador, ambiente, loja],
  );

  // dropdown options: filtered só por data, para que selecionar vendedor não
  // faça os outros dropdowns sumirem
  const dateFiltered = useMemo(
    () => records.filter(r =>
      (!appliedStart || r.pronto >= appliedStart) &&
      (!appliedEnd   || r.pronto <= appliedEnd)
    ),
    [records, appliedStart, appliedEnd],
  );

  const DASH_AMBIENTES   = useMemo(() => [...new Set(dateFiltered.map(r => r.ambiente).filter(Boolean))].sort(),  [dateFiltered]);
  const DASH_VENDEDORES  = useMemo(() => [...new Set(dateFiltered.map(r => r.vendedor).filter(Boolean))].sort(),  [dateFiltered]);
  const DASH_LIBERADORES = useMemo(() => [...new Set(dateFiltered.map(r => r.liberador).filter(Boolean))].sort(), [dateFiltered]);
  const DASH_LOJAS = useMemo(() => {
    const map = new Map<number, string>();
    for (const r of dateFiltered)
      if (r.loja && !map.has(r.loja)) map.set(r.loja, r.loja_nome ?? `Loja ${r.loja}`);
    return [...map.entries()].map(([id, nome]) => ({ id, nome })).sort((a, b) => a.id - b.id);
  }, [dateFiltered]);

  // Registros filtrados + cross-filter aplicado
  const crossFiltered = useMemo(() => {
    if (!crossFilter) return filtered;
    return filtered.filter(r => {
      if (crossFilter.dim === 'ambiente')  return r.ambiente  === crossFilter.value;
      if (crossFilter.dim === 'vendedor')  return r.vendedor  === crossFilter.value;
      if (crossFilter.dim === 'liberador') return r.liberador === crossFilter.value;
      return true;
    });
  }, [filtered, crossFilter]);

  const topAmbiente  = useMemo(() => topKey(crossFiltered, "ambiente"),  [crossFiltered]);
  const topVendedor  = useMemo(() => topKey(crossFiltered, "vendedor"),  [crossFiltered]);
  const topLiberador = useMemo(() => topKey(crossFiltered, "liberador"), [crossFiltered]);

  // Cada gráfico usa crossFiltered, mas exclui o próprio eixo para continuar mostrando todas as barras
  const ambData = useMemo(() => {
    const src = crossFilter?.dim === 'ambiente' ? filtered : crossFiltered;
    const counts = new Map<string, number>();
    for (const r of src) if (r.ambiente) counts.set(r.ambiente, (counts.get(r.ambiente) ?? 0) + 1);
    return [...counts.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => a.name.localeCompare(b.name));
  }, [filtered, crossFiltered, crossFilter]);

  const vendData = useMemo(() => {
    const src = crossFilter?.dim === 'vendedor' ? filtered : crossFiltered;
    const counts = new Map<string, number>();
    for (const r of src) if (r.vendedor) counts.set(r.vendedor, (counts.get(r.vendedor) ?? 0) + 1);
    return [...counts.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => a.name.localeCompare(b.name));
  }, [filtered, crossFiltered, crossFilter]);

  const libData = useMemo(() => {
    const src = crossFilter?.dim === 'liberador' ? filtered : crossFiltered;
    const counts = new Map<string, number>();
    for (const r of src) if (r.liberador) counts.set(r.liberador, (counts.get(r.liberador) ?? 0) + 1);
    return [...counts.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => a.name.localeCompare(b.name));
  }, [filtered, crossFiltered, crossFilter]);

  const lojaData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of crossFiltered) counts.set(String(r.loja), (counts.get(String(r.loja)) ?? 0) + 1);
    return DASH_LOJAS.map(({ id, nome }, i) => ({
      name:  nome,
      value: counts.get(String(id)) ?? 0,
      color: LOJA_PALETTE[i % LOJA_PALETTE.length],
    }));
  }, [crossFiltered, DASH_LOJAS]);

  const periodoData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of crossFiltered) {
      const m = r.pronto.slice(0, 7);
      counts.set(m, (counts.get(m) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([m, value]) => ({ name: PT_MONTHS[Number(m.slice(5)) - 1], value }));
  }, [crossFiltered]);

  const avgPeriodo = useMemo(() => {
    const nz = periodoData.filter(d => d.value > 0);
    return nz.length ? Math.round(nz.reduce((s, d) => s + d.value, 0) / nz.length) : 0;
  }, [periodoData]);

  const avgLib = useMemo(() => {
    const nz = libData.filter(d => d.value > 0);
    return nz.length ? Math.round(nz.reduce((s, d) => s + d.value, 0) / nz.length) : 0;
  }, [libData]);

  function handleApply() {
    setAppliedStart(startDate);
    setAppliedEnd(endDate);
    setPreferencias({ [PREF_START]: startDate, [PREF_END]: endDate }).catch(() => {});
  }

  function handleClear() {
    setStartDate(DEFAULT_INICIO); setEndDate(DEFAULT_FIM);
    setAppliedStart(DEFAULT_INICIO); setAppliedEnd(DEFAULT_FIM);
    setVendedor(""); setLiberador(""); setAmbiente(""); setLoja("");
    setCrossFilter(null);
    setPreferencias({ [PREF_START]: DEFAULT_INICIO, [PREF_END]: DEFAULT_FIM }).catch(() => {});
  }

  return (
    <ProjetosContext.Provider value={{
      startDate, setStartDate, endDate, setEndDate,
      vendedor, setVendedor, liberador, setLiberador,
      ambiente, setAmbiente, loja, setLoja,
      DASH_VENDEDORES, DASH_LIBERADORES, DASH_AMBIENTES, DASH_LOJAS,
      totalFiltrado: crossFiltered.length,
      topAmbiente, topVendedor, topLiberador,
      ambData, vendData, libData, lojaData, periodoData,
      avgPeriodo, avgLib,
      crossFilter, handleBarClick,
      handleApply, handleClear,
    }}>
      {children}
    </ProjetosContext.Provider>
  );
}

export function useProjectos() {
  const ctx = useContext(ProjetosContext);
  if (!ctx) throw new Error("useProjectos deve ser usado dentro de ProjetosProvider");
  return ctx;
}
