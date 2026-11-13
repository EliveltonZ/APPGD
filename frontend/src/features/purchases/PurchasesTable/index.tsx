import { useMemo } from "react";
import { DataTable } from "../../../components/DataTable";
import type { TableColumn } from "../../../components/DataTable";
import type { Purchase, PurchaseStatus } from "../../../types/purchases";
import { STATUS_LABELS } from "../../../data/purchasesConfig";
import type { Category } from "../../../services/utils";
import "./index.css";

interface PurchasesTableProps {
  purchases: Purchase[];
  categories: Category[];
  onSelect: (purchase: Purchase) => void;
  onFilteredChange?: (purchases: Purchase[]) => void;
  loading?: boolean;
}

function fmt(dateStr: string): string {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

type PurchaseRow = Omit<
  Purchase,
  "entrega" | "compra" | "previsao" | "recebido"
> & {
  entrega: string;
  compra: string;
  previsao: string;
  recebido: string;
  _statusLabel: string;
  _categoriaLabel: string;
};

const STATUS_CLS: Record<PurchaseStatus, string> = {
  AGUARDANDO: "aguardando",
  PENDENCIA: "pendencia",
  ATRASADO: "atrasado",
  "A VENCER": "a-vencer",
  ENTREGUE: "entregue",
};

const COLUMNS: TableColumn<PurchaseRow>[] = [
  { key: "id", label: "N°", sortable: true, filterable: false },
  { key: "contrato", label: "Contrato" },
  { key: "cliente", label: "Cliente", minWidth: 130 },
  { key: "ambiente", label: "Ambiente", minWidth: 130 },
  { key: "qtd", label: "Qtd", type: "number" },
  { key: "descricao", label: "Descrição", minWidth: 180 },
  { key: "medida", label: "Medida", render: (v) => (v as string) || "—" },
  {
    key: "_statusLabel",
    label: "Status",
    render: (_, row) => (
      <span
        className={`status-badge status-badge--${STATUS_CLS[row.status as PurchaseStatus]}`}
      >
        {STATUS_LABELS[row.status as PurchaseStatus]}
      </span>
    ),
  },
  { key: "fornecedor", label: "Fornecedor", minWidth: 130 },
  { key: "entrega", label: "Entrega", type: "date-br" },
  { key: "compra", label: "Compra", type: "date-br" },
  { key: "previsao", label: "Previsão", type: "date-br" },
  { key: "recebido", label: "Recebido", type: "date-br" },
  // { key: "_categoriaLabel", label: "Categoria" },
];

export function PurchasesTable({
  purchases,
  categories,
  onSelect,
  onFilteredChange,
  loading,
}: PurchasesTableProps) {
  const rows = useMemo<PurchaseRow[]>(
    () =>
      purchases.map((p) => ({
        ...p,
        entrega: fmt(p.entrega),
        compra: fmt(p.compra),
        previsao: fmt(p.previsao),
        recebido: fmt(p.recebido),
        _statusLabel: STATUS_LABELS[p.status],
        _categoriaLabel: (() => {
          const id = Number(p.categoria);
          if (!isNaN(id) && id > 0)
            return categories.find((c) => c.id === id)?.nome ?? p.categoria;
          return p.categoria || "—";
        })(),
      })),
    [purchases, categories],
  );

  return (
    <DataTable<PurchaseRow>
      columns={COLUMNS}
      data={rows}
      rowKey="id"
      loading={loading}
      emptyMessage="Nenhuma compra encontrada."
      storageKey="dt:compras"
      onRowClick={(row) => {
        const original = purchases.find((p) => p.id === row.id);
        if (original) onSelect(original);
      }}
      rowClassName={(row) =>
        row.status === "ATRASADO" ? "pur-table__row--atrasado" : ""
      }
      onFilteredDataChange={
        onFilteredChange
          ? (filteredRows) => {
              const ids = new Set(filteredRows.map((r) => r.id));
              onFilteredChange(purchases.filter((p) => ids.has(p.id)));
            }
          : undefined
      }
    />
  );
}
