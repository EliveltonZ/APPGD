import { Flag } from "lucide-react";
import { DataTable } from "../../../components/DataTable";
import type { TableColumn } from "../../../components/DataTable";
import type {
  ExpeditionOrder,
  ExpeditionStatus,
} from "../../../types/expedition";
import "./index.css";

interface ExpeditionTableProps {
  orders: ExpeditionOrder[];
  onSelect: (order: ExpeditionOrder) => void;
  loading?: boolean;
}

const STATUS_LABELS: Record<ExpeditionStatus, string> = {
  aguardando: "Aguardando",
  iniciado: "Iniciado",
  pronto: "Pronto",
  atrasado: "Atrasado",
  entregue: "Entregue",
  a_vencer: "A Vencer",
};

const COLUMNS: TableColumn<ExpeditionOrder>[] = [
  { key: "id", label: "N°", sortable: true, filterable: false },
  {
    key: "flagged",
    label: "",
    sortable: false,
    filterable: false,
    render: (v) =>
      v ? <Flag size={12} className="exped-table__flag-icon" /> : null,
  },
  { key: "numOC", label: "NumOC" },
  { key: "pdd", label: "Pdd", filterable: true },
  { key: "e", label: "E", filterable: true },
  { key: "cc", label: "C.C." },
  { key: "cliente", label: "Cliente", minWidth: 120 },
  { key: "contrato", label: "Contrato" },
  { key: "np", label: "N.P." },
  { key: "ambiente", label: "Ambiente", minWidth: 120 },
  { key: "tipo", label: "Tipo" },
  { key: "prazo", label: "Prazo", type: "date-iso" },
  { key: "fabrica", label: "Fábrica" },
  { key: "lote", label: "Lote" },
  {
    key: "status",
    label: "Status",
    render: (v) => (
      <span className={`status-badge status-badge--${v as string}`}>
        {STATUS_LABELS[v as ExpeditionStatus]}
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

export function ExpeditionTable({ orders, onSelect, loading }: ExpeditionTableProps) {
  return (
    <DataTable<ExpeditionOrder>
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
