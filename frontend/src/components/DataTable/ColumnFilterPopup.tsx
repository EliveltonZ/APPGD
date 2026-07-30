import { useState, useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import type { SortDirection, SortState } from '../../types/table';

interface ColumnFilterPopupProps {
  columnKey: string;
  label: string;
  uniqueValues: string[];
  valueLabels?: Record<string, string>;
  activeFilter: Set<string> | undefined;
  activeSort: SortState | null;
  style: React.CSSProperties;
  onApply: (selected: Set<string>) => void;
  onClear: () => void;
  onSort: (direction: SortDirection) => void;
  onClose: () => void;
}

export function ColumnFilterPopup({
  columnKey,
  label,
  uniqueValues,
  valueLabels,
  activeFilter,
  activeSort,
  style,
  onApply,
  onClear,
  onSort,
  onClose,
}: ColumnFilterPopupProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(() => new Set(activeFilter));
  const popupRef = useRef<HTMLDivElement>(null);

  const getLabel = (v: string) => valueLabels?.[v] ?? v;

  const visible = uniqueValues.filter((v) =>
    getLabel(v).toLowerCase().includes(search.toLowerCase())
  );
  const allVisibleChecked = visible.length > 0 && visible.every((v) => selected.has(v));

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleChecked) visible.forEach((v) => next.delete(v));
      else visible.forEach((v) => next.add(v));
      return next;
    });
  };

  const toggle = (value: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const currentDir = activeSort?.key === columnKey ? activeSort.direction : null;

  return (
    <div
      ref={popupRef}
      className="dt-popup"
      style={{ position: 'fixed', zIndex: 1000, ...style }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="dt-popup__title">{label}</div>

      <div className="dt-popup__sort">
        <button
          className={`dt-popup__sort-btn${currentDir === 'asc' ? ' dt-popup__sort-btn--active' : ''}`}
          onClick={() => onSort('asc')}
        >
          <ArrowUp size={12} />
          Crescente
        </button>
        <button
          className={`dt-popup__sort-btn${currentDir === 'desc' ? ' dt-popup__sort-btn--active' : ''}`}
          onClick={() => onSort('desc')}
        >
          <ArrowDown size={12} />
          Decrescente
        </button>
      </div>

      <div className="dt-popup__divider" />

      <input
        className="dt-popup__search"
        type="text"
        placeholder="Buscar..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoFocus
      />

      <div className="dt-popup__toggle-all">
        <label>
          <input type="checkbox" checked={allVisibleChecked} onChange={toggleAll} />
          <span>{allVisibleChecked ? 'Desmarcar' : 'Marcar'} todos ({visible.length})</span>
        </label>
      </div>

      <div className="dt-popup__list">
        {visible.length === 0 ? (
          <span className="dt-popup__empty">Nenhum resultado</span>
        ) : (
          visible.map((v) => (
            <label key={v} className="dt-popup__item">
              <input type="checkbox" checked={selected.has(v)} onChange={() => toggle(v)} />
              <span>{getLabel(v) || '(vazio)'}</span>
            </label>
          ))
        )}
      </div>

      <div className="dt-popup__actions">
        <button
          className="dt-popup__btn dt-popup__btn--clear"
          onClick={() => { onClear(); onClose(); }}
        >
          Limpar
        </button>
        <button
          className="dt-popup__btn dt-popup__btn--apply"
          onClick={() => { onApply(selected); onClose(); }}
        >
          Aplicar
        </button>
      </div>
    </div>
  );
}
