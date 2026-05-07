import { Search, X } from "lucide-react";
import "./index.css";

interface StatusFilterProps {
  filterDate: string;
  filterStatus: string;
  filterText: string;
  onDateChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onTextChange: (v: string) => void;
  onClear: () => void;
}

export function StatusFilter({
  filterDate,
  filterStatus,
  filterText,
  onDateChange,
  onStatusChange,
  onTextChange,
  onClear,
}: StatusFilterProps) {
  const hasFilter = filterDate || filterStatus || filterText;

  return (
    <div className="st-filter">
      <label className="st-filter__field st-filter__field--grow">
        <span className="st-filter__label">Busca</span>
        <div className="st-filter__input-wrap">
          <Search size={13} className="st-filter__search-icon" />
          <input
            type="text"
            className="st-filter__input st-filter__input--search"
            placeholder="Cliente, N° OC, N° Projeto…"
            value={filterText}
            onChange={(e) => onTextChange(e.target.value)}
          />
        </div>
      </label>

      <label className="st-filter__field">
        <span className="st-filter__label">Entrega a partir de</span>
        <input
          type="date"
          className="st-filter__input"
          value={filterDate}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </label>

      <label className="st-filter__field">
        <span className="st-filter__label">Status</span>
        <select
          className="st-filter__input"
          value={filterStatus}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="aguardando">Aguardando</option>
          <option value="em_producao">Em Produção</option>
          <option value="concluido">Concluído</option>
          <option value="atrasado">Atrasado</option>
        </select>
      </label>

      {hasFilter && (
        <button
          type="button"
          className="st-filter__clear"
          onClick={onClear}
          title="Limpar filtros"
        >
          <X size={13} />
          Limpar
        </button>
      )}
    </div>
  );
}
