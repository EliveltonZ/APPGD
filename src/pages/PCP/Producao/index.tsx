import { useState, useEffect } from "react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { ProductionTable } from "../../../features/production/ProductionTable";
import { ProductionModal } from "../../../features/production/ProductionModal";
import { useApiData } from "../../../hooks/useApiData";
import {
  fetchProductionOrders,
  fetchProductionDetail,
  fetchEmployees,
} from "../../../services/production";
import { emptySetores } from "../../../data/productionConfig";
import type {
  ProductionOrder,
  ProductionDetail,
  Employee,
} from "../../../types/production";
import "./index.css";

export function ProducaoPage() {
  const { data: fetchedOrders = [], loading: loadingOrders } = useApiData(
    fetchProductionOrders,
  );
  const { data: employees = [] } = useApiData(fetchEmployees);

  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<ProductionDetail | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (fetchedOrders.length) setOrders(fetchedOrders);
  }, [fetchedOrders]);

  async function handleSelect(order: ProductionOrder) {
    const detail = await fetchProductionDetail(order.id);
    setSelectedDetail(
      detail ?? {
        orderId: order.id,
        ordemCompra: order.numOC,
        contrato: order.contrato,
        cliente: order.cliente,
        ambiente: order.ambiente,
        numeroProjeto: order.np,
        lote: order.lote,
        chegouFabrica: "",
        prazo: order.prazo,
        previsao: "",
        observacoes: "",
        setores: emptySetores(),
        materiais: [],
      },
    );
    setModalOpen(true);
  }

  function handleSave(detail: ProductionDetail) {
    console.log("Saving:", detail);
    setModalOpen(false);
  }

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

        <ProductionTable
          orders={orders}
          onSelect={handleSelect}
          loading={loadingOrders}
        />
      </div>

      <ProductionModal
        isOpen={modalOpen}
        detail={selectedDetail}
        employees={employees as Employee[]}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </AppLayout>
  );
}
