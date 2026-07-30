import { Search } from 'lucide-react';
import type { ForecastProjectStatus } from '../../../types/forecast';
import { FORECAST_PROJECT_STATUS_LABELS } from '../../../data/forecastConfig';
import './index.css';

const ALL_STATUSES: ForecastProjectStatus[] = [
  'INICIADO', 'URGENTE', 'ATRASADO', 'A VENCER', 'PARCEADO', 'PENDENCIA',
];

interface ForecastFiltersProps {
  search: string;
  filterLote: string;
  filterStatus: ForecastProjectStatus | '';
  filterPrazo: string;
  loteOptions: string[];
  onSearchChange: (v: string) => void;
  onLoteChange: (v: string) => void;
  onStatusChange: (v: ForecastProjectStatus | '') => void;
  onPrazoChange: (v: string) => void;
}

export function ForecastFilters({
  search,
  filterLote,
  filterStatus,
  filterPrazo,
  loteOptions,
  onSearchChange,
  onLoteChange,
  onStatusChange,
  onPrazoChange,
}: ForecastFiltersProps) {
  return (
    <div className="fcst-filters">
      <div className="fcst-filters__search">
        <Search size={13} className="fcst-filters__search-icon" />
        <input
          type="text"
          placeholder="Buscar por OC, cliente, contrato, ambiente…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="fcst-filters__search-input"
        />
      </div>

      <div className="fcst-filters__field">
        <label>Lote</label>
        <select value={filterLote} onChange={(e) => onLoteChange(e.target.value)}>
          <option value="">Todos</option>
          {loteOptions.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      <div className="fcst-filters__field">
        <label>Status</label>
        <select
          value={filterStatus}
          onChange={(e) => onStatusChange(e.target.value as ForecastProjectStatus | '')}
        >
          <option value="">Todos</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{FORECAST_PROJECT_STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      <div className="fcst-filters__field">
        <label>Prazo até</label>
        <input
          type="date"
          value={filterPrazo}
          onChange={(e) => onPrazoChange(e.target.value)}
        />
      </div>
    </div>
  );
}
