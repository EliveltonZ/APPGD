import { useProductionDashboard } from "../ProductionProvider";

export function ProductionSidebar() {
  const { status, setStatus, DASH_STATUS } = useProductionDashboard();

  return (
    <div className="proj-dash__filters">
      <div className="proj-dash__filter-group">
        <label className="proj-dash__filter-label">Status</label>
        <select
          className="proj-dash__select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Selecione</option>
          {DASH_STATUS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
