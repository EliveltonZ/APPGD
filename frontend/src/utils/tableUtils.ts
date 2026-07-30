import type { TableValueType } from '../types/table';

export function detectValueType(value: unknown): TableValueType {
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string') {
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return 'date-br';
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return 'date-iso';
    const normalized = value.replace(/\./g, '').replace(',', '.');
    if (/^-?[\d.]+$/.test(normalized) && !isNaN(parseFloat(normalized))) return 'number';
  }
  return 'text';
}

function toSortKey(value: unknown, type: TableValueType): number | string {
  if (value == null || value === '') return '';
  switch (type) {
    case 'number': {
      const n = parseFloat(String(value).replace(/\./g, '').replace(',', '.'));
      return isNaN(n) ? 0 : n;
    }
    case 'date-br': {
      const parts = String(value).split('/');
      return parts.length === 3 ? `${parts[2]}${parts[1]}${parts[0]}` : String(value);
    }
    case 'date-iso':
      return String(value).slice(0, 10).replace(/-/g, '');
    default:
      return String(value).toLowerCase();
  }
}

export function sortData<T extends object>(
  data: T[],
  key: string,
  direction: 'asc' | 'desc',
  type: TableValueType
): T[] {
  return [...data].sort((a, b) => {
    const row = (r: T) => (r as Record<string, unknown>)[key];
    const ak = toSortKey(row(a), type);
    const bk = toSortKey(row(b), type);
    let cmp: number;
    if (typeof ak === 'number' && typeof bk === 'number') {
      cmp = ak - bk;
    } else {
      cmp = String(ak).localeCompare(String(bk), 'pt-BR', { numeric: true });
    }
    return direction === 'asc' ? cmp : -cmp;
  });
}

export function getUniqueValues(data: object[], key: string): string[] {
  const seen = new Set<string>();
  let hasEmpty = false;
  for (const row of data) {
    const v = (row as Record<string, unknown>)[key];
    if (v == null || v === '') { hasEmpty = true; continue; }
    seen.add(String(v));
  }
  const sorted = Array.from(seen).sort((a, b) =>
    a.localeCompare(b, 'pt-BR', { numeric: true })
  );
  if (hasEmpty) sorted.unshift('');
  return sorted;
}

export function applyFilters<T extends object>(
  data: T[],
  filters: Record<string, Set<string>>
): T[] {
  const entries = Object.entries(filters).filter(([, s]) => s.size > 0);
  if (entries.length === 0) return data;
  return data.filter((row) =>
    entries.every(([key, selected]) =>
      selected.has(String((row as Record<string, unknown>)[key] ?? ''))
    )
  );
}
