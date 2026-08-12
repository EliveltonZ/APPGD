import { useParadas } from "./paradasContext";

export function ParadasFilters() {
  const { startDate, setStartDate, endDate, setEndDate, handleApply, handleClear } = useParadas();

  return (
    <div className="proj-dash__filters">
      <p className="proj-dash__filter-note">
        Filtro de período aplicado a todos os gráficos de paradas de máquina.
      </p>

      <div className="proj-dash__filter-group">
        <label className="proj-dash__filter-label">Data de Início</label>
        <input
          type="date"
          className="proj-dash__input"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <div className="proj-dash__filter-group">
        <label className="proj-dash__filter-label">Data de Fim</label>
        <input
          type="date"
          className="proj-dash__input"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <div className="proj-dash__filter-actions">
        <button type="button" className="proj-dash__btn proj-dash__btn--primary" onClick={handleApply}>
          Filtrar
        </button>
        <button type="button" className="proj-dash__btn proj-dash__btn--secondary" onClick={handleClear}>
          Limpar
        </button>
      </div>
    </div>
  );
}
