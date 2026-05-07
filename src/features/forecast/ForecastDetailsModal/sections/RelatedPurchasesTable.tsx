import { useMemo } from "react";
import { AcessoriosTable } from "../../../../components/AcessoriosTable";
import type { AcessorioRow } from "../../../../components/AcessoriosTable";
import type { Material } from "../../../../types/production";

interface RelatedPurchasesTableProps {
  materials: Material[];
}

function dateBr(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function RelatedPurchasesTable({ materials }: RelatedPurchasesTableProps) {
  const rows = useMemo<AcessorioRow[]>(
    () =>
      materials.map((m) => ({
        id: m.id,
        descricao: m.descricao,
        medida: m.medida,
        qtd: m.qtd,
        compra: dateBr(m.compra),
        previsao: dateBr(m.previsao),
        recebido: !!m.recebido,
      })),
    [materials],
  );

  return (
    <AcessoriosTable rows={rows} emptyMessage="Nenhum material cadastrado." />
  );
}