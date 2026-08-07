import { DataTable } from "../../../components/DataTable";
import { TableFlag } from "../../../components/TableFlag";
import type { TableColumn } from "../../../components/DataTable";
import type {
  ProductionOrder,
  ProductionStatus,
} from "../../../types/production";
import "./index.css";

interface ProductionTableProps {
  orders: ProductionOrder[];
  onSelect: (order: ProductionOrder) => void;
  onFilteredChange?: (rows: ProductionOrder[]) => void;
  loading?: boolean;
}

const STATUS_LABELS: Record<ProductionStatus, string> = {
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

const COLUMNS: TableColumn<ProductionOrder>[] = [
  {
    key: "total",
    label: "",
    minWidth: 36,
    sortable: false,
    filterable: false,
    render: (v) => <TableFlag active={(v as number) > 0} />,
  },
  { key: "ordemdecompra", label: "N°", sortable: true },
  { key: "pedido", label: "Pdd" },
  { key: "etapa", label: "Etapa", filterable: true, sortable: true },
  { key: "codcc", label: "C.C", sortable: true },
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
      const isUrgente = val === "URGENTE";
      return (
        <span
          className={[
            "status-badge",
            `status-badge--${val.toLowerCase().replace(/ /g, "-")}`,
            isUrgente ? "transition" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {STATUS_LABELS[val as ProductionStatus] ?? val}
        </span>
      );
    },
  },
  {
    key: "iniciado",
    label: "Iniciado",
    type: "date-br",
    render: (v) => (v as string | null) ?? "—",
  },
  {
    key: "previsao",
    label: "Previsão",
    type: "date-br",
    render: (v, row) => {
      const val = (v as string | null) ?? "—";
      const diff = v && row.dataentrega && (v as string) !== row.dataentrega;
      return <span className={diff ? "row--previsao-alt" : ""}>{val}</span>;
    },
  },
  {
    key: "pronto",
    label: "Pronto",
    type: "date-br",
    render: (v) => (v as string | null) ?? "—",
  },
  {
    key: "entrega",
    label: "Entrega",
    type: "date-br",
    render: (v) => (v as string | null) ?? "—",
  },
];

export function ProductionTable({
  orders,
  onSelect,
  onFilteredChange,
  loading,
}: ProductionTableProps) {
  return (
    <DataTable<ProductionOrder>
      columns={COLUMNS}
      data={orders}
      rowKey="ordemdecompra"
      loading={loading}
      emptyMessage="Nenhum pedido encontrado."
      showIndex
      onRowClick={onSelect}
      onFilteredDataChange={onFilteredChange}
      storageKey="dt:producao"
      rowClassName={(row) =>
        row.status === "ATRASADO" ? "fcst-table__row--atrasado" : ""
      }
    />
  );
}
