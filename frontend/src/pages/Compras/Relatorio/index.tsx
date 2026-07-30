import { useState, useEffect } from "react";
import { LayoutList, Clock, AlertTriangle, PackageCheck } from "lucide-react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { SummaryCard } from "../../../components/SummaryCard";
import { PurchasesTable } from "../../../features/purchases/PurchasesTable";
import { PurchaseModal } from "../../../features/purchases/PurchaseModal";
import {
  fetchPurchases,
  fetchPurchaseFilterDate,
  savePurchase,
} from "../../../services/purchases";
import {
  saveConfigDate,
  fetchCategories,
  type Category,
} from "../../../services/utils";
import type { Purchase } from "../../../types/purchases";
import { useToast } from "../../../context/ToastContext";
import "./index.css";

export function RelatorioComprasPage() {
  const toast = useToast();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [visiblePurchases, setVisiblePurchases] = useState<Purchase[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Purchase | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterDate, setFilterDate] = useState<string | null>(null);
  const [inputDate, setInputDate] = useState("");

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  // Fetch the configured filter date (id=3) before loading the table
  useEffect(() => {
    fetchPurchaseFilterDate()
      .then((d) => {
        setFilterDate(d);
        setInputDate(d ?? "");
      })
      .catch(() => {
        setFilterDate("");
        setInputDate("");
      });
  }, []);

  function loadPurchases(date: string | null) {
    setLoading(true);
    fetchPurchases(date || undefined)
      .then((data) => {
        setPurchases(data);
        setVisiblePurchases(data);
      })
      .catch(() => toast.error("Erro ao carregar compras."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (filterDate === null) return; // wait for filter date to load
    loadPurchases(filterDate);
  }, [filterDate]);

  const summaryTotal = visiblePurchases.length;
  const summaryPendente = visiblePurchases.filter(
    (p) => p.status === "AGUARDANDO" || p.status === "PENDENCIA",
  ).length;
  const summaryAtrasado = visiblePurchases.filter(
    (p) => p.status === "ATRASADO",
  ).length;
  const summaryRecebido = visiblePurchases.filter(
    (p) => p.status === "ENTREGUE",
  ).length;

  function handleSelect(purchase: Purchase) {
    setSelected(purchase);
    setModalOpen(true);
  }

  async function handleSave(updated: Purchase) {
    try {
      await savePurchase(updated);
      setModalOpen(false);
      toast.success("Compra atualizada com sucesso.");
      loadPurchases(filterDate);
    } catch {
      toast.error("Erro ao salvar compra.");
    }
  }

  return (
    <AppLayout pageTitle="Compras">
      <div className="pur-page">
        <div className="pur-page__top">
          <div>
            <h1 className="pur-page__title">Relatório de Compras</h1>
            {!loading && (
              <p className="pur-page__subtitle">
                {visiblePurchases.length} item
                {visiblePurchases.length !== 1 ? "s" : ""} encontrado
                {visiblePurchases.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <label className="pur-filter-label">
            <span>Entrega a partir de</span>
            <input
              type="date"
              className="pur-filter-input"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                setFilterDate(inputDate);
                if (inputDate) saveConfigDate(3, inputDate);
              }}
            />
          </label>
        </div>

        <div className="pur-summary">
          <SummaryCard
            label="Total"
            value={summaryTotal}
            accent="var(--text-h)"
            icon={<LayoutList size={13} />}
            loading={loading}
          />
          <SummaryCard
            label="Pendentes"
            value={summaryPendente}
            accent="#6b6375"
            icon={<Clock size={13} />}
            loading={loading}
          />
          <SummaryCard
            label="Atrasados"
            value={summaryAtrasado}
            accent="var(--atrasado)"
            icon={<AlertTriangle size={13} />}
            loading={loading}
          />
          <SummaryCard
            label="Recebidos"
            value={summaryRecebido}
            accent="var(--entregue)"
            icon={<PackageCheck size={13} />}
            loading={loading}
          />
        </div>

        <PurchasesTable
          purchases={purchases}
          categories={categories}
          onSelect={handleSelect}
          onFilteredChange={setVisiblePurchases}
          loading={loading}
        />
      </div>

      <PurchaseModal
        isOpen={modalOpen}
        purchase={selected}
        categories={categories}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </AppLayout>
  );
}
