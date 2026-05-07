import { CheckCircle2, Clock } from "lucide-react";
import "./index.css";

export interface AcessorioRow {
  id: string;
  descricao: string;
  medida: string;
  qtd: number;
  compra: string;
  previsao: string;
  recebido: boolean;
}

interface AcessoriosTableProps {
  rows: AcessorioRow[];
  emptyMessage?: string;
}

export function AcessoriosTable({
  rows,
  emptyMessage = "Nenhum item registrado.",
}: AcessoriosTableProps) {
  if (rows.length === 0) {
    return <div className="acc-table__empty">{emptyMessage}</div>;
  }

  return (
    <div className="acc-table__wrapper">
      <table className="acc-table">
        <thead>
          <tr>
            <th className="acc-table__th">Descrição</th>
            <th className="acc-table__th">Medida</th>
            <th className="acc-table__th acc-table__th--center">Qtd</th>
            <th className="acc-table__th">Compra</th>
            <th className="acc-table__th">Previsão</th>
            <th className="acc-table__th acc-table__th--center">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="acc-table__row">
              <td className="acc-table__td">{row.descricao}</td>
              <td className="acc-table__td">{row.medida}</td>
              <td className="acc-table__td acc-table__td--center">{row.qtd}</td>
              <td className="acc-table__td">{row.compra}</td>
              <td className="acc-table__td">{row.previsao}</td>
              <td className="acc-table__td acc-table__td--center">
                {row.recebido ? (
                  <span className="acc-table__badge acc-table__badge--ok">
                    <CheckCircle2 size={12} /> Recebido
                  </span>
                ) : (
                  <span className="acc-table__badge acc-table__badge--pend">
                    <Clock size={12} /> Pendente
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
