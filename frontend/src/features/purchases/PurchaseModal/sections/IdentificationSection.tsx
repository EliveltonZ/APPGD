import type { Purchase } from '../../../../types/purchases';

interface Props { data: Purchase; }

export function IdentificationSection({ data }: Props) {
  return (
    <div className="pinfo-section">
      <div className="frow frow--4">
        <div className="pfield">
          <label>N° ID</label>
          <input type="text" value={data.id} disabled readOnly />
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
      <div className="frow frow--2">
        <div className="pfield">
          <label>Ambiente</label>
          <input type="text" value={data.ambiente} disabled readOnly />
        </div>
      </div>
    </div>
  );
}
