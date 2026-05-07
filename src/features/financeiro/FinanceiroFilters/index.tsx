import { Search, X } from 'lucide-react';
import type { FinanceiroFiltersState } from '../../../types/financeiro';
import { MARGIN_FILTER_OPTIONS } from '../../../data/financeiroConfig';
import './index.css';

interface FinanceiroFiltersProps {
  filters: FinanceiroFiltersState;
  onChange: (filters: FinanceiroFiltersState) => void;
  lojas: string[];
}

const DEFAULT: FinanceiroFiltersState = { search: '', marginFilter: 'all', loja: 'all' };

function hasActive(f: FinanceiroFiltersState): boolean {
  return f.search !== '' || f.marginFilter !== 'all' || f.loja !== 'all';
}

export function FinanceiroFilters({ filters, onChange, lojas }: FinanceiroFiltersProps) {
  const set = (patch: Partial<FinanceiroFiltersState>) =>
    onChange({ ...filters, ...patch });

  return (
    <div className="fin-filters">
      {/* Search */}
      <div className="fin-filters__search-wrap">
        <Search className="fin-filters__search-icon" size={14} />
        <input
          className="fin-filters__search"
          type="text"
          placeholder="Buscar por cliente, contrato ou NumOC…"
          value={filters.search}
          onChange={(e) => set({ search: e.target.value })}
        />
        {filters.search && (
          <button
            className="fin-filters__search-clear"
            onClick={() => set({ search: '' })}
            aria-label="Limpar busca"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Margin filter */}
      <select
        className="fin-filters__select"
        value={filters.marginFilter}
        onChange={(e) =>
          set({ marginFilter: e.target.value as FinanceiroFiltersState['marginFilter'] })
        }
      >
        {MARGIN_FILTER_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Loja filter */}
      <select
        className="fin-filters__select"
        value={filters.loja}
        onChange={(e) => set({ loja: e.target.value })}
      >
        <option value="all">Todas as lojas</option>
        {lojas.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>

      {/* Clear all */}
      {hasActive(filters) && (
        <button
          className="fin-filters__clear"
          onClick={() => onChange(DEFAULT)}
        >
          <X size={13} />
          Limpar filtros
        </button>
      )}
    </div>
  );
}