import { Link } from "react-router-dom";
import { useProjectsDashboard } from "../ProjectsProvider";

export function ProjectsSidebar() {
  const {
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
    vendedor,
    setVendedor,
    liberador,
    setLiberador,
    ambiente,
    setAmbiente,
    loja,
    setLoja,
    DASH_AMBIENTES,
    DASH_VENDEDORES,
    DASH_LIBERADORES,
    DASH_LOJAS,
    handleApply,
    handleClear,
  } = useProjectsDashboard();

  return (
    <div className="proj-dash__filters">
      <div className="proj-dash__filter-group">
        <label className="proj-dash__filter-label">Data de Início</label>
        <input
          type="date"
          className="proj-dash__input"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
        />
      </div>

      <div className="proj-dash__filter-group">
        <label className="proj-dash__filter-label">Data de Fim</label>
        <input
          type="date"
          className="proj-dash__input"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
        />
      </div>

      <div className="proj-dash__filter-group">
        <label className="proj-dash__filter-label">Vendedores</label>
        <select
          className="proj-dash__select"
          value={vendedor}
          onChange={(e) => setVendedor(e.target.value)}
        >
          <option value="">Selecione um Vendedor</option>
          {DASH_VENDEDORES.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>

      <div className="proj-dash__filter-group">
        <label className="proj-dash__filter-label">Liberadores</label>
        <select
          className="proj-dash__select"
          value={liberador}
          onChange={(e) => setLiberador(e.target.value)}
        >
          <option value="">Selecione um Liberador</option>
          {DASH_LIBERADORES.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      <div className="proj-dash__filter-group">
        <label className="proj-dash__filter-label">Ambiente</label>
        <select
          className="proj-dash__select"
          value={ambiente}
          onChange={(e) => setAmbiente(e.target.value)}
        >
          <option value="">Selecione um Ambiente</option>
          {DASH_AMBIENTES.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      <div className="proj-dash__filter-group">
        <label className="proj-dash__filter-label">Loja</label>
        <select
          className="proj-dash__select"
          value={loja}
          onChange={(e) => setLoja(e.target.value)}
        >
          <option value="">Selecione uma Loja</option>
          {DASH_LOJAS.map(({ id, nome }) => (
            <option key={id} value={id}>{nome}</option>
          ))}
        </select>
      </div>

      <div className="proj-dash__filter-actions">
        <button
          type="button"
          className="proj-dash__btn proj-dash__btn--primary"
          onClick={handleApply}
        >
          Filtrar
        </button>

        <button
          type="button"
          className="proj-dash__btn proj-dash__btn--secondary"
          onClick={handleClear}
        >
          Limpar
        </button>

        <Link to="/" className="proj-dash__link-home">
          Início
        </Link>
      </div>
    </div>
  );
}
