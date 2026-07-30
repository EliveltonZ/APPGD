import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { fetchDashProducaoDetalhada, type ProducaoDetalhada, type EtapaRow } from "../../../services/dashboard";
import { calcWorkMinutes } from "../../../utils/workTime";
import { getPreferencias, setPreferencias } from "../../../services/preferencias";

const DEFAULT_INICIO = "2024-01-01";
const DEFAULT_FIM    = new Date().toISOString().slice(0, 10);

const PREF_START = "dash_start";
const PREF_END   = "dash_end";

const PT_MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

export function fmtMes(yyyymm: string) {
  const [y, m] = yyyymm.split("-");
  return `${PT_MONTHS[Number(m) - 1]}/${y.slice(2)}`;
}

const EMPTY: ProducaoDetalhada = {
  totalEmProd: 0, urgentesEmProd: 0,
  statusDist: [], esteiraViva: [], etapaRows: [],
  leadTimePorMes: [], onTimePorMes: [],
};

// Mapeamento etapa → campos de timestamp no EtapaRow
const STAGE_PAIRS: { label: string; ini: keyof EtapaRow; fim: keyof EtapaRow }[] = [
  { label: 'Corte',        ini: 'corteinicio',        fim: 'cortefim'        },
  { label: 'Customização', ini: 'customizacaoinicio',  fim: 'customizacaofim' },
  { label: 'Coladora',     ini: 'coladeirainicio',     fim: 'coladeirafim'    },
  { label: 'Usinagem',     ini: 'usinageminicio',      fim: 'usinagemfim'     },
  { label: 'Montagem',     ini: 'montageminicio',      fim: 'montagemfim'     },
  { label: 'Painéis',      ini: 'paineisinicio',       fim: 'paineisfim'      },
  { label: 'Embalagem',    ini: 'embalageminicio',     fim: 'embalagemfim'    },
  { label: 'Acabamento',   ini: 'acabamentoinicio',    fim: 'acabamentofim'   },
];

interface ProducaoContextValue {
  startDate: string; setStartDate: (v: string) => void;
  endDate:   string; setEndDate:   (v: string) => void;
  // current state (sem filtro de data)
  totalEmProd:    number;
  urgentesEmProd: number;
  statusDist:     { name: string; value: number }[];
  filteredStatusDist: { name: string; value: number }[];
  esteiraViva:    { name: string; aguardando: number; iniciado: number; finalizado: number }[];
  etapaTempos:    { name: string; value: number }[];
  // historical (filtrado por data aplicada)
  leadTimeFiltered: { mes: string; label: string; avgDias: number; total: number }[];
  onTimeFiltered:   { mes: string; label: string; noPrazo: number; atrasado: number; total: number }[];
  avgLeadTime: number;
  pctNoPrazo:  number;
  // cross-filter: tempo real (etapa) e histórico (mês) são independentes
  liveFilter: string | null;
  histFilter: string | null;
  handleLiveClick: (value: string) => void;
  handleHistClick: (value: string) => void;
  handleApply: () => void;
  handleClear: () => void;
}

const ProducaoContext = createContext<ProducaoContextValue | null>(null);

export function ProducaoProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ProducaoDetalhada>(EMPTY);

  const [startDate, setStartDate] = useState(DEFAULT_INICIO);
  const [endDate,   setEndDate]   = useState(DEFAULT_FIM);
  const [appliedStart, setAppliedStart] = useState(DEFAULT_INICIO);
  const [appliedEnd,   setAppliedEnd]   = useState(DEFAULT_FIM);

  const [liveFilter, setLiveFilter] = useState<string | null>(null);
  const [histFilter, setHistFilter] = useState<string | null>(null);

  function handleLiveClick(value: string) {
    setLiveFilter(prev => prev === value || !value ? null : value);
  }
  function handleHistClick(value: string) {
    setHistFilter(prev => prev === value || !value ? null : value);
  }

  // Carrega preferências salvas uma única vez ao montar
  useEffect(() => {
    getPreferencias([PREF_START, PREF_END]).then(prefs => {
      const s = prefs[PREF_START] ?? DEFAULT_INICIO;
      const e = prefs[PREF_END]   ?? DEFAULT_FIM;
      setStartDate(s);
      setEndDate(e);
      setAppliedStart(s);
      setAppliedEnd(e);
    }).catch(e => console.error('[preferencias GET]', e));
  }, []);

  useEffect(() => {
    fetchDashProducaoDetalhada(appliedStart, appliedEnd).then(setData).catch(() => {});
  }, [appliedStart, appliedEnd]);

  const leadTimeFiltered = useMemo(() =>
    data.leadTimePorMes
      .filter(r => r.mes >= appliedStart.slice(0, 7) && r.mes <= appliedEnd.slice(0, 7))
      .map(r => ({ ...r, label: fmtMes(r.mes) })),
    [data.leadTimePorMes, appliedStart, appliedEnd],
  );

  const onTimeFiltered = useMemo(() =>
    data.onTimePorMes
      .filter(r => r.mes >= appliedStart.slice(0, 7) && r.mes <= appliedEnd.slice(0, 7))
      .map(r => ({ ...r, label: fmtMes(r.mes) })),
    [data.onTimePorMes, appliedStart, appliedEnd],
  );

  const avgLeadTime = useMemo(() => {
    if (!leadTimeFiltered.length) return 0;
    const totalProj = leadTimeFiltered.reduce((s, r) => s + r.total, 0);
    const soma = leadTimeFiltered.reduce((s, r) => s + r.avgDias * r.total, 0);
    return totalProj ? Math.round(soma / totalProj) : 0;
  }, [leadTimeFiltered]);

  const pctNoPrazo = useMemo(() => {
    const total    = onTimeFiltered.reduce((s, r) => s + r.total, 0);
    const noPrazo  = onTimeFiltered.reduce((s, r) => s + r.noPrazo, 0);
    return total ? Math.round((noPrazo / total) * 100) : 0;
  }, [onTimeFiltered]);

  // Média de horas produtivas por etapa (exclui horas fora do expediente)
  const etapaTempos = useMemo(() =>
    STAGE_PAIRS.map(({ label, ini, fim }) => {
      const mins = data.etapaRows
        .map(row => calcWorkMinutes(row[ini], row[fim]))
        .filter(m => m > 0);
      const avg = mins.length ? mins.reduce((s, m) => s + m, 0) / mins.length : 0;
      return { name: label, value: Math.round((avg / 60) * 10) / 10 };
    }).filter(e => e.value > 0),
    [data.etapaRows],
  );

  // Quando uma etapa está selecionada na Esteira, deriva o status só daquela etapa
  const filteredStatusDist = useMemo(() => {
    if (!liveFilter) return data.statusDist;
    const row = data.esteiraViva.find(r => r.name === liveFilter);
    if (!row) return data.statusDist;
    return [
      { name: 'AGUARDANDO', value: row.aguardando },
      { name: 'INICIADO',   value: row.iniciado   },
      { name: 'PRONTO',     value: row.finalizado  },
    ].filter(s => s.value > 0);
  }, [data.statusDist, data.esteiraViva, liveFilter]);

  function handleApply() {
    setAppliedStart(startDate);
    setAppliedEnd(endDate);
    setPreferencias({ [PREF_START]: startDate, [PREF_END]: endDate }).catch(e => console.error('[preferencias POST]', e));
  }

  function handleClear() {
    setStartDate(DEFAULT_INICIO); setEndDate(DEFAULT_FIM);
    setAppliedStart(DEFAULT_INICIO); setAppliedEnd(DEFAULT_FIM);
    setLiveFilter(null); setHistFilter(null);
    setPreferencias({ [PREF_START]: DEFAULT_INICIO, [PREF_END]: DEFAULT_FIM }).catch(e => console.error('[preferencias POST]', e));
  }

  return (
    <ProducaoContext.Provider value={{
      startDate, setStartDate, endDate, setEndDate,
      totalEmProd:    data.totalEmProd,
      urgentesEmProd: data.urgentesEmProd,
      statusDist:     data.statusDist,
      filteredStatusDist,
      esteiraViva:    data.esteiraViva,
      etapaTempos,
      leadTimeFiltered, onTimeFiltered,
      avgLeadTime, pctNoPrazo,
      liveFilter, histFilter,
      handleLiveClick, handleHistClick,
      handleApply, handleClear,
    }}>
      {children}
    </ProducaoContext.Provider>
  );
}

export function useProducao() {
  const ctx = useContext(ProducaoContext);
  if (!ctx) throw new Error("useProducao deve ser usado dentro de ProducaoProvider");
  return ctx;
}
