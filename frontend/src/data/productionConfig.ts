import type { SectorConfig, SectorData } from "../types/production";

export const PRODUCTION_SECTORS: SectorConfig[] = [
  { id: "corte", label: "Corte" },
  { id: "coladeira", label: "Coladeira" },
  { id: "customizacao", label: "Customização" },
  { id: "usinagem", label: "Usinagem" },
  { id: "paineis", label: "Painéis" },
  { id: "montagem", label: "Montagem" },
  { id: "acabamento", label: "Acabamentos" },
  { id: "embalagem", label: "Embalagem" },
];

export function emptySectorData(): SectorData {
  return {
    inicio: "",
    fim: "",
    pausa: false,
    responsavelId: "",
    responsavelNome: "",
  };
}

export function emptySetores(): Record<string, SectorData> {
  return Object.fromEntries(
    PRODUCTION_SECTORS.map((s) => [s.id, emptySectorData()]),
  );
}
