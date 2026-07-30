import { useProjectos } from "./context";

export function ProjetosFilters() {
  const {
    startDate, setStartDate, endDate, setEndDate,
    vendedor, setVendedor, liberador, setLiberador,
    ambiente, setAmbiente, loja, setLoja,
    DASH_VENDEDORES, DASH_LIBERADORES, DASH_AMBIENTES, DASH_LOJAS,
    handleApply, handleClear,
  } = useProjectos();

  return (
    <div className="proj-dash__filters">
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

      <div className="proj-dash__filter-group">
        <label className="proj-dash__filter-label">Vendedor</label>
        <select className="proj-dash__select" value={vendedor} onChange={(e) => setVendedor(e.target.value)}>
          <option value="">Selecione um Vendedor</option>
          {DASH_VENDEDORES.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      <div className="proj-dash__filter-group">
        <label className="proj-dash__filter-label">Liberador</label>
        <select className="proj-dash__select" value={liberador} onChange={(e) => setLiberador(e.target.value)}>
          <option value="">Selecione um Liberador</option>
          {DASH_LIBERADORES.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      <div className="proj-dash__filter-group">
        <label className="proj-dash__filter-label">Ambiente</label>
        <select className="proj-dash__select" value={ambiente} onChange={(e) => setAmbiente(e.target.value)}>
          <option value="">Selecione um Ambiente</option>
          {DASH_AMBIENTES.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div className="proj-dash__filter-group">
        <label className="proj-dash__filter-label">Loja</label>
        <select className="proj-dash__select" value={loja} onChange={(e) => setLoja(e.target.value)}>
          <option value="">Selecione uma Loja</option>
          {DASH_LOJAS.map(({ id, nome }) => <option key={id} value={id}>{nome}</option>)}
        </select>
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
