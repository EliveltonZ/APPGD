import { Flag } from "lucide-react";
import { DataTable } from "../../../components/DataTable";
import type { TableColumn } from "../../../components/DataTable";
import type {
  ProductionOrder,
  ProductionStatus,
} from "../../../types/production";
import "./index.css";

interface ProductionTableProps {
  orders: ProductionOrder[];
  onSelect: (order: ProductionOrder) => void;
  loading?: boolean;
}

const STATUS_LABELS: Record<ProductionStatus, string> = {
  aguardando: "Aguardando",
  iniciado: "Iniciado",
  pronto: "Pronto",
  atrasado: "Atrasado",
  entregue: "Entregue",
  a_vencer: "A Vencer",
};

const COLUMNS: TableColumn<ProductionOrder>[] = [
  { key: "id", label: "N°", sortable: true, filterable: false },
  {
    key: "flagged",
    label: "",
    sortable: false,
    filterable: false,
    render: (v) =>
      v ? <Flag size={12} className="prod-table__flag-icon" /> : null,
  },
  { key: "numOC", label: "NumOC" },
  { key: "pdd", label: "Pdd", filterable: false },
  { key: "e", label: "E", filterable: false },
  { key: "cliente", label: "Cliente", minWidth: 120 },
  { key: "contrato", label: "Contrato" },
  { key: "np", label: "N.P." },
  { key: "ambiente", label: "Ambiente", minWidth: 120 },
  { key: "tipo", label: "Tipo" },
  { key: "fabrica", label: "Fábrica" },
  { key: "prazo", label: "Prazo", type: "date-br" },
  { key: "lote", label: "Lote" },
  {
    key: "status",
    label: "Status",
    render: (v) => (
      <span className={`status-badge status-badge--${v as string}`}>
        {STATUS_LABELS[v as ProductionStatus]}
      </span>
    ),
  },
  {
    key: "iniciado",
    label: "Iniciado",
    type: "date-br",
    filterable: false,
    render: (v) => (v as string | null) ?? "—",
  },
  {
    key: "previsao",
    label: "Previsão",
    type: "date-br",
    filterable: false,
    render: (v) => (v as string | null) ?? "—",
  },
  {
    key: "pronto",
    label: "Pronto",
    type: "date-br",
    filterable: false,
    render: (v) => (v as string | null) ?? "—",
  },
  {
    key: "entrega",
    label: "Entrega",
    type: "date-br",
    filterable: false,
    render: (v) => (v as string | null) ?? "—",
  },
];

export function ProductionTable({
  orders,
  onSelect,
  loading,
}: ProductionTableProps) {
  return (
    <DataTable<ProductionOrder>
      columns={COLUMNS}
      data={orders}
      rowKey="id"
      loading={loading}
      emptyMessage="Nenhum pedido encontrado."
      onRowClick={onSelect}
      rowClassName={(row) =>
        row.status === "atrasado" ? "fcst-table__row--atrasado" : ""
      }
    />
  );
}
