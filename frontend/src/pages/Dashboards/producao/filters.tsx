import { useProducao } from "./context";

export function ProducaoFilters() {
  const {
    startDate, setStartDate, endDate, setEndDate,
    handleApply, handleClear,
  } = useProducao();

  return (
    <div className="proj-dash__filters">
      <p className="proj-dash__filter-note">
        Filtro de período aplicado aos gráficos históricos (lead time e pontualidade).
        Dados ao vivo não são afetados.
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
