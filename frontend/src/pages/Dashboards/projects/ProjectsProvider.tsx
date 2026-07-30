import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { fetchDashProjetos, type DashboardRecord } from "../../../services/dashboard";

type SetString = Dispatch<SetStateAction<string>>;

export interface LojaOption { id: number; nome: string }

type ProjectsDashboardContextValue = {
  dataInicio: string;
  setDataInicio: SetString;
  dataFim: string;
  setDataFim: SetString;
  vendedor: string;
  setVendedor: SetString;
  liberador: string;
  setLiberador: SetString;
  ambiente: string;
  setAmbiente: SetString;
  loja: string;
  setLoja: SetString;
  filtered: DashboardRecord[];
  DASH_AMBIENTES: string[];
  DASH_VENDEDORES: string[];
  DASH_LIBERADORES: string[];
  DASH_LOJAS: LojaOption[];
  handleApply: () => void;
  handleClear: () => void;
};

const ProjectsContext = createContext<ProjectsDashboardContextValue | null>(null);

const DEFAULT_INICIO = "2025-01-01";
const DEFAULT_FIM    = "2025-12-31";

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<DashboardRecord[]>([]);

  // O que está nos inputs (muda a cada tecla, não filtra)
  const [dataInicio, setDataInicio] = useState(DEFAULT_INICIO);
  const [dataFim,    setDataFim]    = useState(DEFAULT_FIM);

  // O que realmente filtra (só muda ao clicar em Filtrar ou Limpar)
  const [appliedInicio, setAppliedInicio] = useState(DEFAULT_INICIO);
  const [appliedFim,    setAppliedFim]    = useState(DEFAULT_FIM);

  const [vendedor,  setVendedor]  = useState("");
  const [liberador, setLiberador] = useState("");
  const [ambiente,  setAmbiente]  = useState("");
  const [loja,      setLoja]      = useState("");

  useEffect(() => {
    fetchDashProjetos()
      .then((data) => {
        console.log('[Dashboard] total registros:', data.length, '| meses únicos:', [...new Set(data.map(r => r.mes))].sort());
        setRecords(data);
      })
      .catch((err) => console.error('[Dashboard] erro ao buscar:', err));
  }, []);

  const mesInicio = appliedInicio.slice(0, 7);
  const mesFim    = appliedFim.slice(0, 7);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (mesInicio && r.mes < mesInicio)         return false;
      if (mesFim    && r.mes > mesFim)            return false;
      if (vendedor  && r.vendedor  !== vendedor)  return false;
      if (liberador && r.liberador !== liberador) return false;
      if (ambiente  && r.ambiente  !== ambiente)  return false;
      if (loja      && r.loja !== Number(loja))   return false;
      return true;
    });
  }, [records, mesInicio, mesFim, vendedor, liberador, ambiente, loja]);

  const DASH_AMBIENTES = useMemo(
    () => [...new Set(records.map((r) => r.ambiente).filter(Boolean))].sort(),
    [records]
  );
  const DASH_VENDEDORES = useMemo(
    () => [...new Set(records.map((r) => r.vendedor).filter(Boolean))].sort(),
    [records]
  );
  const DASH_LIBERADORES = useMemo(
    () => [...new Set(records.map((r) => r.liberador).filter(Boolean))].sort(),
    [records]
  );
  const DASH_LOJAS = useMemo(() => {
    const map = new Map<number, string>();
    for (const r of records) {
      if (r.loja && !map.has(r.loja))
        map.set(r.loja, r.loja_nome ?? `Loja ${r.loja}`);
    }
    return [...map.entries()]
      .map(([id, nome]) => ({ id, nome }))
      .sort((a, b) => a.id - b.id);
  }, [records]);

  // Aplica as datas dos inputs ao filtro — não reseta outros filtros
  function handleApply() {
    setAppliedInicio(dataInicio);
    setAppliedFim(dataFim);
  }

  // Limpa tudo e volta ao padrão
  function handleClear() {
    setDataInicio(DEFAULT_INICIO);
    setDataFim(DEFAULT_FIM);
    setAppliedInicio(DEFAULT_INICIO);
    setAppliedFim(DEFAULT_FIM);
    setVendedor("");
    setLiberador("");
    setAmbiente("");
    setLoja("");
  }

  return (
    <ProjectsContext.Provider
      value={{
        dataInicio, setDataInicio,
        dataFim,    setDataFim,
        vendedor,   setVendedor,
        liberador,  setLiberador,
        ambiente,   setAmbiente,
        loja,       setLoja,
        filtered,
        DASH_AMBIENTES,
        DASH_VENDEDORES,
        DASH_LIBERADORES,
        DASH_LOJAS,
        handleApply,
        handleClear,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjectsDashboard() {
  const context = useContext(ProjectsContext);
  if (!context)
    throw new Error("useProjectsDashboard precisa ser usado dentro de ProjectsProvider.");
  return context;
}
