import { Search, X } from 'lucide-react';
import { Select } from '../../../../components/Select';
import type { QualityFilters } from '../../../../types/qualityControl';
import {
  OCCURRENCE_FILTER_OPTIONS,
  FAILURE_FILTER_OPTIONS,
  CAUSE_FILTER_OPTIONS,
  QC_STATUS_FILTER_OPTIONS,
} from '../../../../data/qualityControlConfig';
import './index.css';

interface Props {
  filters: QualityFilters;
  onChange: (f: QualityFilters) => void;
}

export function QualityFilters({ filters, onChange }: Props) {
  const hasActive =
    filters.search !== '' ||
    filters.ocorrencia !== 'all' ||
    filters.falha !== 'all' ||
    filters.causa !== 'all' ||
    filters.status !== 'all';

  function clear() {
    onChange({ search: '', ocorrencia: 'all', falha: 'all', causa: 'all', status: 'all' });
  }

  return (
    <div className="qc-filters">
      <div className="qc-filters__search">
        <Search size={14} className="qc-filters__search-icon" />
        <input
          className="qc-filters__input"
          type="text"
          placeholder="Buscar por cliente, peça, assistência ou ambiente..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
        {filters.search && (
          <button
            className="qc-filters__clear-btn"
            onClick={() => onChange({ ...filters, search: '' })}
            type="button"
            aria-label="Limpar busca"
          >
            <X size={11} />
          </button>
        )}
      </div>

      <Select
        value={filters.status}
        onChange={(e) =>
          onChange({ ...filters, status: e.target.value as QualityFilters['status'] })
        }
        options={QC_STATUS_FILTER_OPTIONS}
      />

      <Select
        value={filters.ocorrencia}
        onChange={(e) =>
          onChange({ ...filters, ocorrencia: e.target.value as QualityFilters['ocorrencia'] })
        }
        options={OCCURRENCE_FILTER_OPTIONS}
      />

      <Select
        value={filters.falha}
        onChange={(e) => onChange({ ...filters, falha: e.target.value })}
        options={FAILURE_FILTER_OPTIONS}
      />

      <Select
        value={filters.causa}
        onChange={(e) =>
          onChange({ ...filters, causa: e.target.value })
        }
        options={CAUSE_FILTER_OPTIONS}
      />

      {hasActive && (
        <button className="qc-filters__reset" onClick={clear} type="button">
          <X size={12} />
          Limpar filtros
        </button>
      )}
    </div>
  );
}