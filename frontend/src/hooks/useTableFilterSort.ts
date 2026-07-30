import { useState, useMemo, useCallback, useEffect } from 'react';
import type { TableColumn, SortState, ColumnFilters, TableValueType } from '../types/table';
import { sortData, applyFilters, detectValueType } from '../utils/tableUtils';

interface PersistedState {
  filters: Record<string, string[]>;
  sort: SortState | null;
}

function loadPersistedState(storageKey: string): PersistedState | null {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

function deserializeFilters(raw: Record<string, string[]>): ColumnFilters {
  return Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, new Set(v)]));
}

function serializeFilters(filters: ColumnFilters): Record<string, string[]> {
  return Object.fromEntries(Object.entries(filters).map(([k, v]) => [k, [...v]]));
}

export function useTableFilterSort<T extends object>(
  data: T[],
  columns: TableColumn<T>[],
  storageKey?: string
) {
  const [sort, setSort] = useState<SortState | null>(() => {
    if (!storageKey) return null;
    return loadPersistedState(storageKey)?.sort ?? null;
  });

  const [filters, setFilters] = useState<ColumnFilters>(() => {
    if (!storageKey) return {};
    const persisted = loadPersistedState(storageKey);
    return persisted ? deserializeFilters(persisted.filters) : {};
  });

  useEffect(() => {
    if (!storageKey) return;
    const state: PersistedState = { filters: serializeFilters(filters), sort };
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [filters, sort, storageKey]);

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

  const getFilteredDataExcluding = useCallback(
    (key: string): T[] => {
      const otherFilters = Object.fromEntries(
        Object.entries(filters).filter(([k]) => k !== key),
      );
      return applyFilters(data, otherFilters);
    },
    [data, filters],
  );

  return {
    processedData,
    sort,
    filters,
    applySort,
    applyColumnFilter,
    clearColumnFilter,
    getColumnType,
    getFilteredDataExcluding,
  };
}
