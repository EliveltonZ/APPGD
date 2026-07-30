import { Search, X } from 'lucide-react';
import { Select } from '../../../../components/Select';
import type { AssistanceFilters } from '../../../../types/assistenciaProducao';
import { ASSISTANCE_STATUS_OPTIONS, AP_URGENTE_FILTER_OPTIONS } from '../../../../data/assistenciaProducaoConfig';
import './index.css';

interface FiltersProps {
  filters: AssistanceFilters;
  onChange: (f: AssistanceFilters) => void;
}

export function AssistanceProductionFilters({ filters, onChange }: FiltersProps) {
  const hasActive =
    filters.search !== '' ||
    filters.prazoDias !== '' ||
    filters.status !== 'all' ||
    filters.urgente !== 'all';

  function clear() {
    onChange({ search: '', prazoDias: '', status: 'all', urgente: 'all' });
  }

  return (
    <div className="ap-filters">
      <div className="ap-filters__search">
        <Search size={14} className="ap-filters__search-icon" />
        <input
          className="ap-filters__input"
          type="text"
          placeholder="Buscar por solicitação, contrato, cliente ou ambiente..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
        {filters.search && (
          <button
            className="ap-filters__clear-btn"
            onClick={() => onChange({ ...filters, search: '' })}
            type="button"
            aria-label="Limpar busca"
          >
            <X size={11} />
          </button>
        )}
      </div>

      <div className="ap-filters__prazo">
        <span className="ap-filters__prazo-label">Prazo &gt;</span>
        <input
          className="ap-filters__prazo-input"
          type="number"
          min="-99"
          max="999"
          placeholder="—"
          value={filters.prazoDias}
          onChange={(e) =>
            onChange({
              ...filters,
              prazoDias: e.target.value === '' ? '' : Number(e.target.value),
            })
          }
        />
        <span className="ap-filters__prazo-unit">dias</span>
      </div>

      <Select
        value={filters.status}
        onChange={(e) =>
          onChange({ ...filters, status: e.target.value as AssistanceFilters['status'] })
        }
        options={ASSISTANCE_STATUS_OPTIONS}
      />

      <Select
        value={filters.urgente}
        onChange={(e) =>
          onChange({ ...filters, urgente: e.target.value as AssistanceFilters['urgente'] })
        }
        options={AP_URGENTE_FILTER_OPTIONS}
      />

      {hasActive && (
        <button className="ap-filters__reset" onClick={clear} type="button">
          <X size={12} />
          Limpar filtros
        </button>
      )}
    </div>
  );
}