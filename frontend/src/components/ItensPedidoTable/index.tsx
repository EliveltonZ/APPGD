import { CheckCircle2, Clock, Lock, XCircle } from "lucide-react";
import type { PendingItem, PendingStatus } from "../../types/pending";
import "./index.css";

const UNIDADE_LABEL: Record<string, string> = { M2: "m²", M: "m", UN: "un" };

// Rótulo local pro status "EXECUTADO" — nessa tela (consulta de projeto,
// não gestão de pedido) o termo que faz sentido pra quem lê é "Separado"
// (já foi retirado do estoque), não "Executado".
const STATUS_LABEL: Record<PendingStatus, string> = {
  PENDENTE: "Pendente",
  RESERVADO: "Reservado",
  EXECUTADO: "Separado",
  CANCELADO: "Cancelado",
};

const STATUS_ICON: Record<PendingStatus, typeof Clock> = {
  PENDENTE: Clock,
  RESERVADO: Lock,
  EXECUTADO: CheckCircle2,
  CANCELADO: XCircle,
};

function fmtQtd(item: PendingItem): string {
  const base = `${item.quantidade.toLocaleString("pt-BR", { maximumFractionDigits: 4 })} ${UNIDADE_LABEL[item.unidade] ?? item.unidade}`;
  if (item.unidade !== "M2") return base;
  const un = item.qtdUnConfirmada != null ? `${item.qtdUnConfirmada} un` : "— un";
  return `${base} · ${un}`;
}

interface ItensPedidoTableProps {
  items: PendingItem[];
  emptyMessage?: string;
}

export function ItensPedidoTable({
  items,
  emptyMessage = "Nenhum item lançado.",
}: ItensPedidoTableProps) {
  if (items.length === 0) {
    return <div className="ipt-table__empty">{emptyMessage}</div>;
  }

  return (
    <div className="ipt-table__wrapper">
      <table className="ipt-table">
        <thead>
          <tr>
            <th className="ipt-table__th">Código</th>
            <th className="ipt-table__th">Descrição</th>
            <th className="ipt-table__th ipt-table__th--center">Qtd</th>
            <th className="ipt-table__th ipt-table__th--center">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const Icon = STATUS_ICON[item.status];
            return (
              <tr key={item.id} className="ipt-table__row">
                <td className="ipt-table__td">{item.codigoInterno || "—"}</td>
                <td className="ipt-table__td">{item.descricao || "—"}</td>
                <td className="ipt-table__td ipt-table__td--center">{fmtQtd(item)}</td>
                <td className="ipt-table__td ipt-table__td--center">
                  <span className={`ipt-table__badge ipt-table__badge--${item.status.toLowerCase()}`}>
                    <Icon size={12} /> {STATUS_LABEL[item.status]}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
