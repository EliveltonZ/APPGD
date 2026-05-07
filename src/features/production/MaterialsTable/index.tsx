import { useMemo } from "react";
import { AcessoriosTable } from "../../../components/AcessoriosTable";
import type { AcessorioRow } from "../../../components/AcessoriosTable";
import type { Material } from "../../../types/production";

interface MaterialsTableProps {
  materials: Material[];
}

function dateBr(value: string) {
  if (!value) return "";
  const [y, m, d] = value.split("-");
  return `${d}/${m}/${y}`;
}

export function MaterialsTable({ materials }: MaterialsTableProps) {
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