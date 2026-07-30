import { AcessoriosTable } from "../../../../components/AcessoriosTable";
import type { AcessorioRow } from "../../../../components/AcessoriosTable";
import type { PendingAccessory } from "../../../../types/expedition";

interface PendingAccessoriesTableProps {
  items: PendingAccessory[];
}

function dateBr(value: string) {
  if (!value) return "";
  const parts = value.split("-");
  if (parts.length !== 3) return value;
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
}

export function PendingAccessoriesTable({ items }: PendingAccessoriesTableProps) {
  const rows: AcessorioRow[] = items.map((item) => ({
    id: item.id,
    descricao: item.descricao,
    medida: item.medida,
    qtd: item.qtd,
    compra: item.compra,
    previsao: dateBr(item.previsao),
    recebido: item.recebido,
  }));

  return (
    <AcessoriosTable
      rows={rows}
      emptyMessage="Nenhum acessório de compra registrado."
    />
  );
}