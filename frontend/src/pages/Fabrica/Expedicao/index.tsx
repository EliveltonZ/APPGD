import { useState, useMemo, useEffect } from "react";
import { Truck, PackageCheck, AlertTriangle, Clock } from "lucide-react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { Modal } from "../../../components/Modal";
import { Button } from "../../../components/Button";
import { SummaryCard } from "../../../components/SummaryCard";
import { ExpeditionTable } from "../../../features/expedition/ExpeditionTable";
import { ExpeditionModal } from "../../../features/expedition/ExpeditionModal";
import { useParamData } from "../../../hooks/useParamData";
import { useApiData } from "../../../hooks/useApiData";
import { useToast } from "../../../context/ToastContext";
import {
  fetchExpeditionOrders,
  fetchExpeditionDetail,
  fetchExpeditionUsers,
  saveExpeditionData,
} from "../../../services/expedition";
import { fetchConfigDate, saveConfigDate } from "../../../services/utils";
import { emptyExpeditionDetail } from "../../../data/expeditionConfig";
import type {
  ExpeditionOrder,
  ExpeditionDetail,
} from "../../../types/expedition";
import "./index.css";

export function ExpedicaoPage() {
  const toast = useToast();
  const { data: users = [] } = useApiData(fetchExpeditionUsers);

  const [inputDate, setInputDate] = useState("");
  const [filterDate, setFilterDate] = useState<string | null>(null);

  const [selectedDetail, setSelectedDetail] = useState<ExpeditionDetail | null>(null);
  const [selectedOrder,  setSelectedOrder]  = useState<ExpeditionOrder | null>(null);
  const [modalOpen,      setModalOpen]      = useState(false);
  const [loadingDetail,  setLoadingDetail]  = useState(false);
  const [saving,         setSaving]         = useState(false);
  const [visibleOrders,  setVisibleOrders]  = useState<ExpeditionOrder[]>([]);
  const [uncalculatedOpen, setUncalculatedOpen] = useState(false);

  useEffect(() => {
    const fallback = new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 10);
    fetchConfigDate(2)
      .then((d) => {
        const date = d || fallback;
        setInputDate(date);
        setFilterDate(date);
      })
      .catch(() => {
        setInputDate(fallback);
        setFilterDate(fallback);
      });
  }, []);

  const { data: fetchedOrders = [], loading: loadingOrders, reload: reloadOrders } =
    useParamData(fetchExpeditionOrders, filterDate);

  const summaryTotal    = visibleOrders.length;
  const summaryPronto   = visibleOrders.filter((o) => o.status === "PRONTO").length;
  const summaryAtrasado = visibleOrders.filter((o) => o.status === "ATRASADO").length;
  const summaryAVencer  = visibleOrders.filter((o) => o.status === "A VENCER").length;

  async function handleSelectOrder(order: ExpeditionOrder) {
    if (!order.codcc) {
      setUncalculatedOpen(true);
      return;
    }
    setSelectedDetail(null);
    setSelectedOrder(order);
    setModalOpen(true);
    setLoadingDetail(true);
    try {
      const detail = await fetchExpeditionDetail(order.ordemdecompra);
      setSelectedDetail(detail ?? emptyExpeditionDetail(order));
    } finally {
      setLoadingDetail(false);
    }
  }

  async function handleSave(detail: ExpeditionDetail) {
    setSaving(true);
    try {
      await saveExpeditionData(detail);
      toast.success("Expedição salva com sucesso!");
      reloadOrders();
    } catch {
      toast.error("Erro ao salvar expedição.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout pageTitle="Expedição">
      <div className="exped-page">
        <div className="exped-page__top">
          <div>
            <h1 className="exped-page__title">Controle de Expedição</h1>
            {!loadingOrders && (
              <p className="exped-page__subtitle">
                {visibleOrders.length} ordem
                {visibleOrders.length !== 1 ? "s" : ""} em expedição
              </p>
            )}
          </div>
          <label className="exped-page__filter-label">
            <span>Entrega a partir de</span>
            <input
              type="date"
              className="exped-page__filter-input"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && inputDate) {
                  saveConfigDate(2, inputDate);
                  if (filterDate === inputDate) reloadOrders();
                  else setFilterDate(inputDate);
                }
              }}
            />
          </label>
        </div>

        <div className="exped-summary">
          <SummaryCard
            label="Total em Expedição"
            value={summaryTotal}
            accent="var(--text-h)"
            icon={<Truck size={13} />}
            loading={loadingOrders}
          />
          <SummaryCard
            label="Prontos para Entrega"
            value={summaryPronto}
            accent="var(--pronto)"
            icon={<PackageCheck size={13} />}
            loading={loadingOrders}
          />
          <SummaryCard
            label="Atrasados"
            value={summaryAtrasado}
            accent="var(--atrasado)"
            icon={<AlertTriangle size={13} />}
            loading={loadingOrders}
          />
          <SummaryCard
            label="A Vencer"
            value={summaryAVencer}
            accent="var(--a-vencer)"
            icon={<Clock size={13} />}
            loading={loadingOrders}
          />
        </div>

        <ExpeditionTable
          orders={fetchedOrders}
          onSelect={handleSelectOrder}
          loading={loadingOrders}
          onFilteredDataChange={setVisibleOrders}
        />
      </div>

      <Modal
        title="Projeto não calculado"
        isOpen={uncalculatedOpen}
        onClose={() => setUncalculatedOpen(false)}
        maxWidth={400}
        footer={
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              padding: "10px 20px",
              borderTop: "1px solid var(--border)",
            }}
          >
            <Button
              variant="primary"
              size="sm"
              onClick={() => setUncalculatedOpen(false)}
            >
              Entendido
            </Button>
          </div>
        }
      >
        <p style={{ margin: "16px 20px", fontSize: "14px", color: "var(--text)" }}>
          Este projeto ainda não possui Corte calculado e não pode ser aberto.
        </p>
      </Modal>

      <ExpeditionModal
        key={selectedDetail?.ordemdecompra ?? 0}
        isOpen={modalOpen}
        detail={selectedDetail}
        users={users}
        status={selectedOrder?.status}
        loading={loadingDetail}
        saving={saving}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </AppLayout>
  );
}
