import { useState, useEffect } from "react";
import { Layers, Clock, Play, CheckCircle, AlertTriangle } from "lucide-react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { SummaryCard } from "../../../components/SummaryCard";
import { Modal } from "../../../components/Modal";
import { Button } from "../../../components/Button";
import { ProductionTable } from "../../../features/production/ProductionTable";
import { ProductionModal } from "../../../features/production/ProductionModal";
import { useApiData } from "../../../hooks/useApiData";
import { fetchProductionOrders } from "../../../services/production";
import type { ProductionOrder } from "../../../types/production";
import "./index.css";

export function ProducaoPage() {
  const { data: fetchedOrders = [], loading: loadingOrders, refetch: refetchOrders } = useApiData(
    fetchProductionOrders,
  );
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [visible, setVisible] = useState<ProductionOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(
    null,
  );
  const [uncalculatedOpen, setUncalculatedOpen] = useState(false);

  function handleSelect(order: ProductionOrder) {
    if (!order.codcc) {
      setUncalculatedOpen(true);
      return;
    }
    setSelectedOrder(order);
  }

  useEffect(() => {
    if (fetchedOrders.length) setOrders(fetchedOrders);
  }, [fetchedOrders]);

  const total = visible.length;
  const aguardando = visible.filter((o) => o.status === "AGUARDANDO").length;
  const iniciado = visible.filter((o) => o.status === "INICIADO").length;
  const pronto = visible.filter((o) => o.status === "PRONTO").length;
  const atrasado = visible.filter((o) => o.status === "ATRASADO").length;
  const aVencer = visible.filter((o) => o.status === "A VENCER").length;

  return (
    <AppLayout pageTitle="Produção">
      <div className="producao-page">
        <div className="producao-page__top">
          <div>
            <h1 className="producao-page__title">Controle de Produção</h1>
            {!loadingOrders && (
              <p className="producao-page__subtitle">
                {orders.length} ordem{orders.length !== 1 ? "s" : ""} cadastrada
                {orders.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        <div className="producao-page__summary">
          <SummaryCard
            label="Total"
            value={total}
            accent="var(--text-h)"
            icon={<Layers size={13} />}
            loading={loadingOrders}
          />
          <SummaryCard
            label="Aguardando"
            value={aguardando}
            accent="var(--aguardando)"
            icon={<Clock size={13} />}
            loading={loadingOrders}
          />
          <SummaryCard
            label="Iniciado"
            value={iniciado}
            accent="var(--iniciado)"
            icon={<Play size={13} />}
            loading={loadingOrders}
          />
          <SummaryCard
            label="A vencer"
            value={aVencer}
            accent="var(--a-vencer)"
            icon={<Clock size={13} />}
            loading={loadingOrders}
          />
          <SummaryCard
            label="Pronto"
            value={pronto}
            accent="var(--pronto)"
            icon={<CheckCircle size={13} />}
            loading={loadingOrders}
          />
          <SummaryCard
            label="Atrasado"
            value={atrasado}
            accent="var(--atrasado)"
            icon={<AlertTriangle size={13} />}
            loading={loadingOrders}
          />
        </div>

        <ProductionTable
          orders={orders}
          onSelect={handleSelect}
          onFilteredChange={setVisible}
          loading={loadingOrders}
        />
      </div>

      {selectedOrder && (
        <ProductionModal
          isOpen
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSave={refetchOrders}
        />
      )}

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
        <p
          style={{
            margin: "16px 20px",
            fontSize: "14px",
            color: "var(--text)",
          }}
        >
          Este projeto ainda não possui Corte calculado e não pode ser aberto.
        </p>
      </Modal>
    </AppLayout>
  );
}
