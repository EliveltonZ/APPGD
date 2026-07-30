import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Dispatch, SetStateAction } from "react";
import { fetchDashProducao, type ProductionRecord } from "../../../services/dashboard";

export const DASH_STATUS = ["A VENCER", "ATRASADO", "INICIADO", "PENDENCIA"] as const;
export type StatusProd = (typeof DASH_STATUS)[number];

type SetString = Dispatch<SetStateAction<string>>;

type ProductionDashboardContextValue = {
  status: string;
  setStatus: SetString;
  filtered: ProductionRecord[];
  DASH_STATUS: typeof DASH_STATUS;
};

const ProductionContext = createContext<ProductionDashboardContextValue | null>(null);

export function ProductionProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<ProductionRecord[]>([]);
  const [status,  setStatus]  = useState("");

  useEffect(() => {
    fetchDashProducao().then(setRecords).catch(() => {});
  }, []);

  const filtered = useMemo(
    () => records.filter((r) => !status || r.status === status),
    [records, status]
  );

  return (
    <ProductionContext.Provider value={{ status, setStatus, filtered, DASH_STATUS }}>
      {children}
    </ProductionContext.Provider>
  );
}

export function useProductionDashboard() {
  const context = useContext(ProductionContext);
  if (!context)
    throw new Error("useProductionDashboard precisa ser usado dentro de ProductionProvider.");
  return context;
}
