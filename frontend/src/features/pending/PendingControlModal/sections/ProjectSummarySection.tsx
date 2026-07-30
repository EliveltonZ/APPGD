import type { PendingProject } from '../../../../types/pending';

interface Props { data: PendingProject; }

function fmt(dateStr: string): string {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export function ProjectSummarySection({ data }: Props) {
  return (
    <div className="pinfo-section">
      <div className="frow frow--4">
        <div className="pfield">
          <label>N° OC</label>
          <input type="text" value={data.numOC} disabled readOnly />
        </div>
        <div className="pfield">
          <label>Contrato</label>
          <input type="text" value={data.contrato} disabled readOnly />
        </div>
        <div className="pfield pfield--span2">
          <label>Cliente</label>
          <input type="text" value={data.cliente} disabled readOnly />
        </div>
      </div>
      <div className="frow frow--4">
        <div className="pfield pfield--span3">
          <label>Ambiente</label>
          <input type="text" value={data.ambiente} disabled readOnly />
        </div>
        <div className="pfield">
          <label>Entrega</label>
          <input type="text" value={fmt(data.entrega)} disabled readOnly />
        </div>
      </div>
    </div>
  );
}
