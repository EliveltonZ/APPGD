import { useEffect } from "react";
import { useTableFilterSort } from "../../hooks/useTableFilterSort";
import { TableHeaderCell } from "./TableHeaderCell";
import type { DataTableProps } from "../../types/table";
import "./DataTable.css";

// "click" = abre modal com 1 clique | "dblclick" = abre modal com 2 cliques
const ROW_OPEN_EVENT: "click" | "dblclick" = "dblclick";

export function DataTable<T extends object>({
  columns,
  data,
  rowKey,
  emptyMessage = "Nenhum registro encontrado.",
  loading = false,
  className,
  storageKey,
  showIndex = false,
  onRowClick,
  rowClassName,
  onFilteredDataChange,
}: DataTableProps<T>) {
  const {
    processedData,
    sort,
    filters,
    applySort,
    applyColumnFilter,
    clearColumnFilter,
    getFilteredDataExcluding,
  } = useTableFilterSort(data, columns, storageKey);

  useEffect(() => {
    onFilteredDataChange?.(processedData);
  }, [processedData]);

  if (loading) {
    return (
      <div className={`dt-wrapper${className ? ` ${className}` : ""}`}>
        <div className="dt-state dt-state--loading">Carregando...</div>
      </div>
    );
  }

  return (
    <div className={`dt-wrapper${className ? ` ${className}` : ""}`}>
      <div className="dt-scroll">
        <table className="dt-table">
          <thead>
            <tr>
              {showIndex && (
                <th className="dt-th dt-th--index">#</th>
              )}
              {columns.map((col) => (
                <TableHeaderCell
                  key={col.key}
                  column={col}
                  data={getFilteredDataExcluding(col.key)}
                  sort={sort}
                  filters={filters}
                  onSort={applySort}
                  onFilter={applyColumnFilter}
                  onClearFilter={clearColumnFilter}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {processedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="dt-state">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              processedData.map((row, i) => {
                const r = row as Record<string, unknown>;
                const key = rowKey ? String(r[rowKey]) : i;
                return (
                  <tr
                    key={key}
                    className={[
                      "dt-row",
                      onRowClick ? "dt-row--clickable" : "",
                      rowClassName ? rowClassName(row) : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={ROW_OPEN_EVENT === "click" && onRowClick ? () => onRowClick(row) : undefined}
                    onDoubleClick={ROW_OPEN_EVENT === "dblclick" && onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {showIndex && (
                      <td className="dt-td dt-td--index">{i + 1}</td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="dt-td"
                        style={col.align ? { textAlign: col.align } : undefined}
                      >
                        {col.render
                          ? col.render(r[col.key], row)
                          : String(r[col.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
