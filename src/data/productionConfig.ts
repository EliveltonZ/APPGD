import type { SectorConfig, SectorData } from '../types/production'

export const PRODUCTION_SECTORS: SectorConfig[] = [
  { id: 'corte', label: 'Corte' },
  { id: 'customizacao', label: 'Customização' },
  { id: 'coladeira', label: 'Coladeira' },
  { id: 'usinagem', label: 'Usinagem' },
  { id: 'montagem', label: 'Montagem' },
  { id: 'paineis', label: 'Painéis' },
  { id: 'acabamentos', label: 'Acabamentos' },
  { id: 'embalagem', label: 'Embalagem' },
]

export function emptySectorData(): SectorData {
  return {
    inicio: '',
    fim: '',
    pausa: false,
    responsavelId: '',
    responsavelNome: '',
  }
}

export function emptySetores(): Record<string, SectorData> {
  return Object.fromEntries(
    PRODUCTION_SECTORS.map((s) => [s.id, emptySectorData()])
  )
}
