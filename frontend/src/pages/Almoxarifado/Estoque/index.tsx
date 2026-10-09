import { useState } from "react";
import { PackageCheck, Undo2, Boxes } from "lucide-react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { SummaryCard } from "../../../components/SummaryCard";
import { DataTable } from "../../../components/DataTable";
import type { TableColumn } from "../../../components/DataTable";
import { BaixaModal } from "../../../features/pending/PendingControlModal/sections/BaixaModal";
import { useApiData } from "../../../hooks/useApiData";
import { useToast } from "../../../context/ToastContext";
import { getErrorMessage } from "../../../utils/errorMessage";
import {
  fetchProntoParaBaixa,
  liberarReserva as apiLiberarReserva,
  darBaixa as apiDarBaixa,
} from "../../../services/estoque";
import type { EstoquePendenteItem } from "../../../services/estoque";
import { PEND_STATUS_LABELS } from "../../../data/pendingConfig";
import "./index.css";

const TIPO_LABEL: Record<string, string> = { CHAPA: "Chapa", FITA: "Fita", FERRAGEM: "Ferragem" };
const UNIDADE_LABEL: Record<string, string> = { M2: "m²", M: "m", UN: "un" };

function fmtQtd(item: EstoquePendenteItem): string {
  const base = `${item.quantidade.toLocaleString("pt-BR", { maximumFractionDigits: 4 })} ${UNIDADE_LABEL[item.unidade] ?? item.unidade}`;
  if (item.unidade === "UN") return base;
  const un = item.qtdUnConfirmada != null ? `${item.qtdUnConfirmada} un` : "— un";
  return `${base} · ${un}`;
}

export function AlmoxarifadoEstoquePage() {
  const toast = useToast();
  const { data: itens = [], loading, refetch } = useApiData(fetchProntoParaBaixa);

  const [baixaItem, setBaixaItem] = useState<EstoquePendenteItem | null>(null);
  const [acting, setActing] = useState(false);

  async function handleLiberar(item: EstoquePendenteItem) {
    try {
      await apiLiberarReserva(item.id);
      await refetch();
      toast.success("Reserva liberada.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Erro ao liberar reserva."));
    }
  }

  async function handleBaixaConfirm(data: { qtdUnBaixada: number; localizacaoId: number }) {
    if (!baixaItem) return;
    setActing(true);
    try {
      await apiDarBaixa(baixaItem.id, data);
      await refetch();
      toast.success("Baixa registrada.");
      setBaixaItem(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Erro ao dar baixa."));
    } finally {
      setActing(false);
    }
  }

  const columns: TableColumn<EstoquePendenteItem>[] = [
    { key: "codigoInterno", label: "Código", type: "text", sortable: true, filterable: true, minWidth: 90 },
    { key: "descricao", label: "Descrição", type: "text", sortable: true, filterable: true, minWidth: 220 },
    { key: "detalhes", label: "Detalhes", type: "text", minWidth: 120, render: (v) => (v ? String(v) : "—") },
    {
      key: "tipo",
      label: "Tipo",
      type: "text",
      sortable: true,
      align: "center",
      minWidth: 90,
      render: (v) => TIPO_LABEL[String(v)] ?? String(v),
    },
    {
      key: "quantidade",
      label: "Qtd",
      type: "number",
      align: "center",
      minWidth: 110,
      render: (_v, row) => fmtQtd(row),
    },
    {
      key: "contrato",
      label: "Contrato",
      type: "text",
      sortable: true,
      filterable: true,
      minWidth: 100,
    },
    {
      key: "ambiente",
      label: "Pedido / Ambiente",
      type: "text",
      sortable: true,
      filterable: true,
      minWidth: 220,
      render: (v, row) => (
        <span>
          {row.ordemdecompra} — {String(v)}
          {row.cliente ? ` (${row.cliente})` : ""}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      type: "text",
      sortable: true,
      minWidth: 100,
      render: (v) => (
        <span className={`estq-badge estq-badge--${String(v).toLowerCase()}`}>
          {PEND_STATUS_LABELS[v as keyof typeof PEND_STATUS_LABELS] ?? String(v)}
        </span>
      ),
    },
    {
      key: "id",
      label: "Ações",
      type: "text",
      align: "center",
      minWidth: 90,
      render: (_v, row) => (
        <div className="estq-actions">
          <button
            type="button"
            className="estq-action-btn"
            title="Dar baixa"
            onClick={() => setBaixaItem(row)}
          >
            <PackageCheck size={13} />
          </button>
          {row.status === "RESERVADO" && (
            <button
              type="button"
              className="estq-action-btn"
              title="Liberar reserva"
              onClick={() => handleLiberar(row)}
            >
              <Undo2 size={13} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AppLayout pageTitle="Estoque">
      <div className="estq-page">
        <div className="estq-page__top">
          <div>
            <h1 className="estq-page__title">Estoque</h1>
            <p className="estq-page__subtitle">
              Fila de baixa do almoxarifado — tudo que já está reservado, ou
              pendente de material sem controle de estoque mínimo (que não
              precisa de reserva prévia).
            </p>
          </div>
        </div>

        <div className="estq-summary">
          <SummaryCard
            label="Itens prontos para baixa"
            value={itens.length}
            accent="var(--text-h)"
            icon={<Boxes size={13} />}
            loading={loading}
          />
        </div>

        <DataTable
          columns={columns}
          data={itens}
          rowKey="id"
          loading={loading}
          storageKey="almoxarifado-estoque"
          emptyMessage="Nenhum item pronto para baixa no momento."
        />
      </div>

      <BaixaModal
        item={baixaItem}
        saving={acting}
        onClose={() => setBaixaItem(null)}
        onConfirm={handleBaixaConfirm}
      />
    </AppLayout>
  );
}
