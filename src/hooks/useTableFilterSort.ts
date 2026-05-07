import { useState, useMemo, useCallback } from 'react';
import type { TableColumn, SortState, ColumnFilters, TableValueType } from '../types/table';
import { sortData, applyFilters, detectValueType } from '../utils/tableUtils';

export function useTableFilterSort<T extends object>(
  data: T[],
  columns: TableColumn<T>[]
) {
  const [sort, setSort] = useState<SortState | null>(null);
  const [filters, setFilters] = useState<ColumnFilters>({});

  const getColumnType = useCallback(
    (key: string): TableValueType => {
      const col = columns.find((c) => c.key === key);
      if (col?.type) return col.type;
      const sample = data.find((row) => (row as Record<string, unknown>)[key] != null);
      return sample ? detectValueType((sample as Record<string, unknown>)[key]) : 'text';
    },
    [data, columns]
  );

  const processedData = useMemo(() => {
    let result = applyFilters(data, filters);
    if (sort) result = sortData(result, sort.key, sort.direction, getColumnType(sort.key));
    return result;
  }, [data, filters, sort, getColumnType]);

  const applySort = useCallback((key: string, direction: 'asc' | 'desc') => {
    setSort({ key, direction });
  }, []);

  const applyColumnFilter = useCallback((key: string, selected: Set<string>) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (selected.size === 0) delete next[key];
      else next[key] = selected;
      return next;
    });
  }, []);

  const clearColumnFilter = useCallback((key: string) => {
    setFilters((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  return {
    processedData,
    sort,
    filters,
    applySort,
    applyColumnFilter,
    clearColumnFilter,
    getColumnType,
  };
}
