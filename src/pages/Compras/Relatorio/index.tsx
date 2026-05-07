import { useState, useMemo, useEffect } from "react";
import { LayoutList, Clock, AlertTriangle, PackageCheck } from "lucide-react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { SummaryCard } from "../../../components/SummaryCard";
import { PurchasesTable } from "../../../features/purchases/PurchasesTable";
import { PurchaseModal } from "../../../features/purchases/PurchaseModal";
import { useApiData } from "../../../hooks/useApiData";
import { fetchPurchases } from "../../../services/purchases";
import type { Purchase } from "../../../types/purchases";
import { useToast } from "../../../context/ToastContext";
import "./index.css";

export function RelatorioComprasPage() {
  const { data: fetched, loading } = useApiData(fetchPurchases);
  const toast = useToast();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [selected, setSelected] = useState<Purchase | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    if (fetched) setPurchases(fetched);
  }, [fetched]);

  const filtered = useMemo(() => {
    return purchases.filter((p) => {
      if (filterDate && p.entrega && p.entrega < filterDate) return false;
      return true;
    });
  }, [purchases, filterDate]);

  const summaryTotal    = filtered.length;
  const summaryPendente = filtered.filter((p) => p.status === "pendente").length;
  const summaryAtrasado = filtered.filter((p) => p.status === "atrasado").length;
  const summaryRecebido = filtered.filter((p) => p.status === "recebido").length;

  function handleSelect(purchase: Purchase) {
    setSelected(purchase);
    setModalOpen(true);
  }

  function handleSave(updated: Purchase) {
    setPurchases((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setModalOpen(false);
    toast.success("Compra atualizada com sucesso.");
  }

  return (
    <AppLayout pageTitle="Compras">
      <div className="pur-page">
        <div className="pur-page__top">
          <div>
            <h1 className="pur-page__title">Relatório de Compras</h1>
            {!loading && (
              <p className="pur-page__subtitle">
                {filtered.length} item{filtered.length !== 1 ? "s" : ""}{" "}
                encontrado{filtered.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <label className="pur-filter-label">
            <span>Entrega a partir de</span>
            <input
              type="date"
              className="pur-filter-input"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </label>
        </div>

        <div className="pur-summary">
          <SummaryCard label="Total"     value={summaryTotal}    accent="var(--accent)" icon={<LayoutList    size={13} />} loading={loading} />
          <SummaryCard label="Pendentes" value={summaryPendente} accent="#6b6375"        icon={<Clock         size={13} />} loading={loading} />
          <SummaryCard label="Atrasados" value={summaryAtrasado} accent="#dc2626"        icon={<AlertTriangle size={13} />} loading={loading} />
          <SummaryCard label="Recebidos" value={summaryRecebido} accent="#16a34a"        icon={<PackageCheck  size={13} />} loading={loading} />
        </div>

        <PurchasesTable purchases={filtered} onSelect={handleSelect} loading={loading} />
      </div>

      <PurchaseModal
        isOpen={modalOpen}
        purchase={selected}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </AppLayout>
  );
}