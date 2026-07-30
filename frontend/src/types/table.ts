import type { ReactNode } from "react";

export type SortDirection = "asc" | "desc";
export type TableValueType = "text" | "number" | "date-br" | "date-iso";

export interface TableColumn<T extends object = object> {
  key: keyof T & string;
  label: string;
  type?: TableValueType;
  minWidth?: number;
  className?: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: unknown, row: T) => ReactNode;
}

export interface SortState {
  key: string;
  direction: SortDirection;
}

export type ColumnFilters = Record<string, Set<string>>;

export interface DataTableProps<T extends object> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey?: keyof T & string;
  emptyMessage?: string;
  loading?: boolean;
  className?: string;
  storageKey?: string;
  showIndex?: boolean;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
  onFilteredDataChange?: (data: T[]) => void;
}
