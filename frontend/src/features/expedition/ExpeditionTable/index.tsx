import { DataTable } from "../../../components/DataTable";
import { TableFlag } from "../../../components/TableFlag";
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
  onFilteredDataChange?: (data: ExpeditionOrder[]) => void;
}

const STATUS_LABELS: Record<ExpeditionStatus, string> = {
  AGUARDANDO: "Aguardando",
  INICIADO: "Iniciado",
  PRONTO: "Pronto",
  ATRASADO: "Atrasado",
  ENTREGUE: "Entregue",
  "A VENCER": "A Vencer",
  PARCEADO: "Parceado",
  URGENTE: "Urgente",
  PENDENCIA: "Pendência",
};

const COLUMNS: TableColumn<ExpeditionOrder>[] = [
  {
    key: "total",
    label: "",
    minWidth: 36,
    sortable: false,
    filterable: false,
    render: (v) => <TableFlag active={(v as number) > 0} />,
  },
  { key: "ordemdecompra", label: "N°", sortable: true, filterable: false },
  { key: "pedido", label: "Pdd", filterable: true },
  { key: "etapa", label: "Etapa", filterable: true, sortable: true },
  { key: "codcc", label: "C.C." },
  { key: "cliente", label: "Cliente", minWidth: 120 },
  { key: "contrato", label: "Contrato" },
  { key: "numproj", label: "N.P." },
  { key: "ambiente", label: "Ambiente", minWidth: 120 },
  { key: "tipo", label: "Tipo" },
  { key: "chegoufabrica", label: "Fábrica", type: "date-br" },
  { key: "dataentrega", label: "Prazo", type: "date-br" },
  { key: "lote", label: "Lote" },
  {
    key: "status",
    label: "Status",
    render: (v) => {
      const val = v as string;
      const isUrgente = val.toLowerCase() === "URGENTE".toLowerCase();
      return (
        <span
          className={[
            `status-badge status-badge--${(v as string).toLowerCase().replace(/ /g, "-")}`,
            isUrgente ? "transition" : "",
          ].join(" ")}
        >
          {STATUS_LABELS[v as ExpeditionStatus] ?? (v as string)}
        </span>
      );
    },
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

export function ExpeditionTable({
  orders,
  onSelect,
  loading,
  onFilteredDataChange,
}: ExpeditionTableProps) {
  return (
    <DataTable<ExpeditionOrder>
      columns={COLUMNS}
      data={orders}
      rowKey="ordemdecompra"
      loading={loading}
      storageKey="dt:expedicao"
      emptyMessage="Nenhum pedido encontrado."
      onRowClick={onSelect}
      onFilteredDataChange={onFilteredDataChange}
      rowClassName={(row) =>
        row.status === "ATRASADO" ? "fcst-table__row--atrasado" : ""
      }
    />
  );
}
