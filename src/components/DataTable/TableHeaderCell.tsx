import { useState, useRef, useCallback } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { ColumnFilterPopup } from './ColumnFilterPopup';
import type { TableColumn, SortState, ColumnFilters, SortDirection } from '../../types/table';
import { getUniqueValues } from '../../utils/tableUtils';

interface TableHeaderCellProps<T extends object> {
  column: TableColumn<T>;
  data: T[];
  sort: SortState | null;
  filters: ColumnFilters;
  onSort: (key: string, direction: SortDirection) => void;
  onFilter: (key: string, selected: Set<string>) => void;
  onClearFilter: (key: string) => void;
}

export function TableHeaderCell<T extends object>({
  column,
  data,
  sort,
  filters,
  onSort,
  onFilter,
  onClearFilter,
}: TableHeaderCellProps<T>) {
  const [open, setOpen] = useState(false);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});
  const thRef = useRef<HTMLTableCellElement>(null);

  const filterable = column.filterable !== false;
  const sortable = column.sortable !== false;
  const hasActive = !!(filters[column.key]?.size);
  const isSorted = sort?.key === column.key;
  const isInteractive = filterable || sortable;

  const uniqueValues = filterable ? getUniqueValues(data, column.key) : [];
  const valueLabels = column.valueFormatter
    ? Object.fromEntries(uniqueValues.map((v) => [v, column.valueFormatter!(v)]))
    : undefined;

  const handleClick = useCallback(() => {
    if (!isInteractive) return;
    if (thRef.current) {
      const rect = thRef.current.getBoundingClientRect();
      const left = Math.min(rect.left, window.innerWidth - 264);
      setPopupStyle({ top: rect.bottom + 2, left: Math.max(8, left) });
    }
    setOpen((v) => !v);
  }, [isInteractive]);

  const thStyle: React.CSSProperties = {};
  if (column.minWidth) thStyle.minWidth = column.minWidth;
  if (isInteractive) thStyle.cursor = 'pointer';

  return (
    <th
      ref={thRef}
      className={[
        'dt-th',
        hasActive ? 'dt-th--filtered' : '',
        isSorted ? 'dt-th--sorted' : '',
        isInteractive ? 'dt-th--interactive' : '',
        column.className ?? '',
      ].filter(Boolean).join(' ')}
      style={thStyle}
      onClick={handleClick}
    >
      <div className="dt-th__inner">
        <span className="dt-th__label">{column.label}</span>
        {isSorted && (
          sort?.direction === 'asc'
            ? <ArrowUp size={10} className="dt-th__sort-icon" />
            : <ArrowDown size={10} className="dt-th__sort-icon" />
        )}
        {hasActive && <span className="dt-th__dot" />}
      </div>

      {open && (
        <ColumnFilterPopup
          columnKey={column.key}
          label={column.label}
          uniqueValues={uniqueValues}
          valueLabels={valueLabels}
          activeFilter={filters[column.key]}
          activeSort={sort}
          style={popupStyle}
          onApply={(selected) => onFilter(column.key, selected)}
          onClear={() => onClearFilter(column.key)}
          onSort={(dir) => onSort(column.key, dir)}
          onClose={() => setOpen(false)}
        />
      )}
    </th>
  );
}
