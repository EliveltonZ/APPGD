import type { ReactNode } from 'react';

export type SortDirection = 'asc' | 'desc';
export type TableValueType = 'text' | 'number' | 'date-br' | 'date-iso';

export interface TableColumn<T extends object = object> {
  key: keyof T & string;
  label: string;
  type?: TableValueType;
  minWidth?: number;
  className?: string;
  sortable?: boolean;
  filterable?: boolean;
  valueFormatter?: (rawValue: string) => string;
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
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
}
