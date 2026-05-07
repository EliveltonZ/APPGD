import { useTableFilterSort } from "../../hooks/useTableFilterSort";
import { TableHeaderCell } from "./TableHeaderCell";
import type { DataTableProps } from "../../types/table";
import "./DataTable.css";

export function DataTable<T extends object>({
  columns,
  data,
  rowKey,
  emptyMessage = "Nenhum registro encontrado.",
  loading = false,
  className,
  onRowClick,
  rowClassName,
}: DataTableProps<T>) {
  const {
    processedData,
    sort,
    filters,
    applySort,
    applyColumnFilter,
    clearColumnFilter,
  } = useTableFilterSort(data, columns);

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
              {columns.map((col) => (
                <TableHeaderCell
                  key={col.key}
                  column={col}
                  data={data}
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
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="dt-td">
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
