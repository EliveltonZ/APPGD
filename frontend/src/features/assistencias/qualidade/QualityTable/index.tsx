import { useMemo } from "react";
import { DataTable } from "../../../../components/DataTable";
import type { TableColumn } from "../../../../components/DataTable";
import type {
  QualityItem,
  AnalysisStatus,
} from "../../../../types/qualityControl";
import { QualityStatusBadge } from "../QualityStatusBadge";
import "./index.css";

function buildColumns(
  falhaOptions: Array<{ value: string; label: string }>,
): TableColumn<QualityItem>[] {
  const falhaLabel = (id: string) =>
    falhaOptions.find((o) => o.value === id)?.label || id || "—";

  return [
    // {
    //   key: "codigo",
    //   label: "Código",
    //   type: "text",
    //   minWidth: 70,
    //   filterable: true,
    //   sortable: true,
    //   render: (v) => <span className="qc-code">{v as string}</span>,
    // },
    {
      key: "idAssistencia",
      label: "ID Assist",
      type: "text",
      minWidth: 90,
      filterable: true,
      sortable: true,
    },
    {
      key: "pedido",
      label: "Pedido",
      type: "text",
      minWidth: 70,
      filterable: true,
      sortable: true,
    },
    {
      key: "idErp",
      label: "ID ERP",
      type: "text",
      minWidth: 50,
      filterable: true,
      sortable: true,
    },
    {
      key: "cliente",
      label: "Cliente",
      type: "text",
      minWidth: 170,
      filterable: true,
      sortable: true,
    },
    {
      key: "peca",
      label: "Peça",
      type: "text",
      minWidth: 160,
      filterable: true,
      sortable: true,
      render: (v) => <span className="qc-peca">{v as string}</span>,
    },
    {
      key: "falha",
      label: "Falha",
      type: "text",
      minWidth: 160,
      filterable: true,
      sortable: true,
      valueFormatter: (v) => falhaLabel(v as string),
      render: (v) => <span>{falhaLabel(v as string)}</span>,
    },
    {
      key: "ambiente",
      label: "Ambiente",
      type: "text",
      minWidth: 130,
      filterable: true,
      sortable: true,
    },
    { key: "dimensoes", label: "Dimensões", type: "text", minWidth: 95 },
    { key: "cor", label: "Cor", type: "text", minWidth: 110, filterable: true },
    {
      key: "status",
      label: "Status",
      type: "text",
      minWidth: 110,
      filterable: true,
      render: (v) => <QualityStatusBadge status={v as AnalysisStatus} />,
    },
  ];
}

interface Props {
  data: QualityItem[];
  loading?: boolean;
  onRowClick: (row: QualityItem) => void;
  falhaOptions: Array<{ value: string; label: string }>;
}

export function QualityTable({
  data,
  loading,
  onRowClick,
  falhaOptions,
}: Props) {
  const columns = useMemo(() => buildColumns(falhaOptions), [falhaOptions]);
  return (
    <DataTable<QualityItem>
      columns={columns}
      data={data}
      rowKey="id"
      loading={loading}
      emptyMessage="Nenhum item encontrado para os filtros aplicados."
      onRowClick={onRowClick}
      rowClassName={(row) =>
        row.status === "pendente" ? "qc-row--pendente" : ""
      }
    />
  );
}
