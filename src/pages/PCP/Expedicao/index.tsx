import { useState, useMemo, useEffect } from 'react';
import { Truck, PackageCheck, AlertTriangle, Clock } from 'lucide-react';
import { AppLayout } from '../../../components/Layout/AppLayout';
import { SummaryCard } from '../../../components/SummaryCard';
import { ExpeditionTable } from '../../../features/expedition/ExpeditionTable';
import { ExpeditionModal } from '../../../features/expedition/ExpeditionModal';
import { useApiData } from '../../../hooks/useApiData';
import {
  fetchExpeditionOrders,
  fetchExpeditionDetail,
  fetchExpeditionUsers,
} from '../../../services/expedition';
import { emptyChecklist, emptyOperacional } from '../../../data/expeditionConfig';
import type { ExpeditionOrder, ExpeditionDetail } from '../../../types/expedition';
import './index.css';

export function ExpedicaoPage() {
  const { data: fetchedOrders = [], loading } = useApiData(fetchExpeditionOrders);
  const { data: users = [] } = useApiData(fetchExpeditionUsers);

  const [orders, setOrders] = useState<ExpeditionOrder[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<ExpeditionDetail | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    if (fetchedOrders.length) setOrders(fetchedOrders);
  }, [fetchedOrders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (filterDate && order.pronto) {
        const pronto = order.pronto.split('/').reverse().join('-');
        if (pronto < filterDate) return false;
      }
      return true;
    });
  }, [orders, filterDate]);

  const summaryTotal    = filteredOrders.length;
  const summaryPronto   = filteredOrders.filter((o) => o.status === 'pronto').length;
  const summaryAtrasado = filteredOrders.filter((o) => o.status === 'atrasado').length;
  const summaryAVencer  = filteredOrders.filter((o) => o.status === 'a_vencer').length;

  async function handleSelectOrder(order: ExpeditionOrder) {
    const detail = await fetchExpeditionDetail(order.id);
    setSelectedDetail(
      detail ?? {
        orderId:             order.id,
        ordemCompra:         order.numOC,
        contrato:            order.contrato,
        cliente:             order.cliente,
        corteCerto:          false,
        ambiente:            order.ambiente,
        numeroProjeto:       order.np,
        lote:                order.lote,
        chegouFabrica:       '',
        prazo:               order.prazo,
        etapaAtual:          '',
        acessoriosPendentes: 0,
        checklist:           emptyChecklist(),
        volumes:             { pequeno: 0, medio: 0, grande: 0 },
        totalVolumes:        0,
        operacional:         emptyOperacional(),
        observacoes:         '',
        acessoriosCompra:    [],
      },
    );
    setModalOpen(true);
  }

  function handleSave(detail: ExpeditionDetail) {
    console.log('Saving expedition detail:', detail);
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== detail.orderId) return o;
        return {
          ...o,
          iniciado: detail.operacional.embalagem.inicio
            ? detail.operacional.embalagem.inicio.slice(0, 10)
            : o.iniciado,
          pronto:  detail.operacional.prontoData  || o.pronto,
          entrega: detail.operacional.entregaData || o.entrega,
        };
      }),
    );
    setModalOpen(false);
  }

  return (
    <AppLayout pageTitle="Expedição">
      <div className="exped-page">
        <div className="exped-page__top">
          <div>
            <h1 className="exped-page__title">Controle de Expedição</h1>
            {!loading && (
              <p className="exped-page__subtitle">
                {filteredOrders.length} ordem{filteredOrders.length !== 1 ? 's' : ''} em expedição
              </p>
            )}
          </div>
          <label className="exped-page__filter-label">
            <span>Entrega a partir de</span>
            <input
              type="date"
              className="exped-page__filter-input"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </label>
        </div>

        <div className="exped-summary">
          <SummaryCard label="Total em Expedição"   value={summaryTotal}    accent="var(--accent)" icon={<Truck         size={13} />} loading={loading} />
          <SummaryCard label="Prontos para Entrega" value={summaryPronto}   accent="#16a34a"        icon={<PackageCheck  size={13} />} loading={loading} />
          <SummaryCard label="Atrasados"            value={summaryAtrasado} accent="#dc2626"        icon={<AlertTriangle size={13} />} loading={loading} />
          <SummaryCard label="A Vencer"             value={summaryAVencer}  accent="#ea580c"        icon={<Clock         size={13} />} loading={loading} />
        </div>

        <ExpeditionTable orders={filteredOrders} onSelect={handleSelectOrder} loading={loading} />
      </div>

      <ExpeditionModal
        isOpen={modalOpen}
        detail={selectedDetail}
        users={users}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </AppLayout>
  );
}