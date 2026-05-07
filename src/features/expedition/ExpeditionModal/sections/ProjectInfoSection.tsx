import type { ExpeditionDetail } from '../../../../types/expedition';

interface ProjectInfoSectionProps {
  detail: ExpeditionDetail;
}

export function ProjectInfoSection({ detail }: ProjectInfoSectionProps) {
  return (
    <div className="pinfo-section">
      <div className="frow frow--4">
        <div className="pfield">
          <label>Ordem de Compra</label>
          <input type="text" value={detail.ordemCompra} disabled readOnly />
        </div>
        <div className="pfield">
          <label>Contrato</label>
          <input type="text" value={detail.contrato} disabled readOnly />
        </div>
        <div className="pfield">
          <label>N° Projeto</label>
          <input type="text" value={detail.numeroProjeto} disabled readOnly />
        </div>
        <div className="pfield">
          <label>Lote</label>
          <input type="text" value={detail.lote} disabled readOnly />
        </div>
      </div>

      <div className="frow frow--4">
        <div className="pfield pfield--span3">
          <label>Cliente</label>
          <input type="text" value={detail.cliente} disabled readOnly />
        </div>
        <div className="pfield">
          <label>Ambiente</label>
          <input type="text" value={detail.ambiente} disabled readOnly />
        </div>
      </div>

      <div className="frow frow--4">
        <div className="pfield">
          <label>Chegou Fábrica</label>
          <input type="date" value={detail.chegouFabrica} disabled readOnly />
        </div>
        <div className="pfield">
          <label>Prazo</label>
          <input type="date" value={detail.prazo} disabled readOnly />
        </div>
        <div className="pfield">
          <label>Etapa Atual</label>
          <input type="text" value={detail.etapaAtual} disabled readOnly />
        </div>
        <div className="pfield">
          <label>Acessórios Pendentes</label>
          <input type="text" value={detail.acessoriosPendentes} disabled readOnly />
        </div>
      </div>
    </div>
  );
}
