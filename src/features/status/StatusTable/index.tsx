import { AlertTriangle, Minus } from "lucide-react";
import { StatusBadge } from "../StatusBadge";
import { TableHeaderCell } from "../../../components/DataTable/TableHeaderCell";
import { useTableFilterSort } from "../../../hooks/useTableFilterSort";
import type { StatusProject, ProjectIndicator } from "../../../types/status";
import type { TableColumn } from "../../../types/table";
import "../../../components/DataTable/DataTable.css";
import "./index.css";

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function isoToBR(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function fmtShort(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

function isPastDue(prazo: string): boolean {
  return prazo < new Date().toISOString().slice(0, 10);
}

function IndicatorCell({ value }: { value: ProjectIndicator }) {
  if (value === "atrasado")
    return (
      <AlertTriangle
        size={13}
        className="st-tbl__flag st-tbl__flag--atrasado"
      />
    );
  if (value === "pendente")
    return (
      <AlertTriangle
        size={13}
        className="st-tbl__flag st-tbl__flag--pendente"
      />
    );
  return <Minus size={12} className="st-tbl__flag st-tbl__flag--ok" />;
}

const COLUMNS: TableColumn<StatusProject>[] = [
  { key: "numOC", label: "NumOC", filterable: true, sortable: true },
  {
    key: "pdd",
    label: "Pdd",
    filterable: true,
    sortable: true,
    type: "date-iso",
    valueFormatter: isoToBR,
  },
  { key: "e", label: "E", filterable: true, sortable: true },
  { key: "cc", label: "C.C.", filterable: true, sortable: true },
  {
    key: "cliente",
    label: "Cliente",
    filterable: true,
    sortable: true,
    minWidth: 140,
  },
  { key: "contrato", label: "Contrato", filterable: true, sortable: true },
  { key: "nProjeto", label: "N° Projeto", filterable: true, sortable: true },
  {
    key: "ambiente",
    label: "Ambiente",
    filterable: true,
    sortable: true,
    minWidth: 140,
  },
  { key: "tipo", label: "Tipo", filterable: true, sortable: true },
  { key: "fabrica", label: "Fábrica", filterable: true, sortable: true },
  {
    key: "entrega",
    label: "Entrega",
    filterable: true,
    sortable: true,
    type: "date-iso",
    valueFormatter: isoToBR,
  },
  {
    key: "prazo",
    label: "Prazo",
    filterable: true,
    sortable: true,
    type: "date-iso",
    valueFormatter: isoToBR,
  },
  { key: "status", label: "Status", filterable: true, sortable: true },
  {
    key: "iniciado",
    label: "Iniciado",
    filterable: true,
    sortable: true,
    type: "date-iso",
    valueFormatter: isoToBR,
  },
  {
    key: "previsao",
    label: "Previsão",
    filterable: true,
    sortable: true,
    type: "date-iso",
    valueFormatter: isoToBR,
  },
  {
    key: "pronto",
    label: "Pronto",
    filterable: true,
    sortable: true,
    type: "date-iso",
    valueFormatter: isoToBR,
  },
  {
    key: "entregue",
    label: "Entregue",
    filterable: true,
    sortable: true,
    type: "date-iso",
    valueFormatter: isoToBR,
  },
];

interface StatusTableProps {
  projects: StatusProject[];
  onRowClick: (project: StatusProject) => void;
  loading?: boolean;
}

export function StatusTable({ projects, onRowClick, loading }: StatusTableProps) {
  const {
    processedData,
    sort,
    filters,
    applySort,
    applyColumnFilter,
    clearColumnFilter,
  } = useTableFilterSort(projects, COLUMNS);

  if (loading) {
    return <div className="st-tbl__empty">Carregando...</div>;
  }

  if (processedData.length === 0) {
    return (
      <div className="st-tbl__empty">
        Nenhum projeto encontrado para os filtros aplicados.
      </div>
    );
  }

  const headerProps = {
    data: projects,
    sort,
    filters,
    onSort: applySort,
    onFilter: applyColumnFilter,
    onClearFilter: clearColumnFilter,
  };

  return (
    <div className="st-tbl__wrap">
      <table className="st-tbl">
        <thead>
          <tr>
            <th className="st-tbl__th st-tbl__th--num">N°</th>
            <th className="st-tbl__th st-tbl__th--flag" title="Indicador" />
            {COLUMNS.map((col) => (
              <TableHeaderCell key={col.key} column={col} {...headerProps} />
            ))}
          </tr>
        </thead>
        <tbody>
          {processedData.map((p) => {
            const late = p.status === "atrasado";
            const prazoClass =
              isPastDue(p.prazo) && p.status !== "concluido"
                ? " st-tbl__td--late"
                : "";
            return (
              <tr
                key={p.id}
                className={`st-tbl__row${late ? " st-tbl__row--atrasado" : ""}`}
                onClick={() => onRowClick(p)}
              >
                <td className="st-tbl__td st-tbl__td--num">{p.numero}</td>
                <td className="st-tbl__td st-tbl__td--center">
                  <IndicatorCell value={p.indicador} />
                </td>
                <td className="st-tbl__td st-tbl__td--mono">{p.numOC}</td>
                <td className="st-tbl__td">{fmtShort(p.pdd)}</td>
                <td className="st-tbl__td">{p.e}</td>
                <td className="st-tbl__td">{p.cc}</td>
                <td
                  className="st-tbl__td st-tbl__td--truncate"
                  title={p.cliente}
                >
                  {p.cliente}
                </td>
                <td className="st-tbl__td st-tbl__td--mono">{p.contrato}</td>
                <td className="st-tbl__td st-tbl__td--mono">{p.nProjeto}</td>
                <td
                  className="st-tbl__td st-tbl__td--truncate"
                  title={p.ambiente}
                >
                  {p.ambiente}
                </td>
                <td className="st-tbl__td">{p.tipo}</td>
                <td className="st-tbl__td">{p.fabrica}</td>
                <td className="st-tbl__td">{fmtDate(p.entrega)}</td>
                <td className={`st-tbl__td${prazoClass}`}>
                  {fmtDate(p.prazo)}
                </td>
                <td className="st-tbl__td">
                  <StatusBadge status={p.status} size="sm" />
                </td>
                <td className="st-tbl__td">{fmtDate(p.iniciado)}</td>
                <td className="st-tbl__td">{fmtDate(p.previsao)}</td>
                <td className="st-tbl__td">{fmtDate(p.pronto)}</td>
                <td className="st-tbl__td">{fmtDate(p.entregue)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
