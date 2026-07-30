export function ProducaoFilters() {
  return (
    <div className="proj-dash__filters">
      <div className="proj-dash__filter-group">
        <label className="proj-dash__filter-label">Data de Início</label>
        <input type="date" className="proj-dash__input" disabled />
      </div>
      <div className="proj-dash__filter-group">
        <label className="proj-dash__filter-label">Data de Fim</label>
        <input type="date" className="proj-dash__input" disabled />
      </div>
      <div className="proj-dash__filter-actions">
        <button type="button" className="proj-dash__btn proj-dash__btn--primary" disabled>
          Filtrar
        </button>
        <button type="button" className="proj-dash__btn proj-dash__btn--secondary" disabled>
          Limpar
        </button>
      </div>
    </div>
  );
}

export function ProducaoCharts() {
  return (
    <div className="proj-dash__placeholder">
      <div className="proj-dash__placeholder-inner">
        <span className="proj-dash__placeholder-icon">🏭</span>
        <h2 className="proj-dash__placeholder-title">Dashboard de Produção</h2>
        <p className="proj-dash__placeholder-text">
          Área reservada para os gráficos de produção.
        </p>
        <ul className="proj-dash__placeholder-list">
          <li>Status por projeto (A Vencer / Atrasado / Iniciado / Pendência)</li>
          <li>Projetos em produção por período</li>
          <li>Taxa de entrega no prazo</li>
          <li>Evolução diária da produção</li>
        </ul>
      </div>
    </div>
  );
}
