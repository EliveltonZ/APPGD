import type { AccessoryChecklistItem, OperationalStatus } from '../types/expedition';

export const CHECKLIST_ITEMS_CONFIG: { id: string; label: string }[] = [
  { id: 'acessorios_avulsos', label: 'Acessórios Avulsos' },
  { id: 'paineis', label: 'Painéis' },
  { id: 'portas_aluminio', label: 'Portas de Alumínio' },
  { id: 'vidros_espelhos', label: 'Vidros / Espelhos' },
  { id: 'pecas_pintura', label: 'Peças com Pintura' },
  { id: 'tapecaria', label: 'Tapeçaria' },
  { id: 'serralheria', label: 'Serralheria' },
  { id: 'cabide', label: 'Cabide' },
  { id: 'trilhos', label: 'Trilhos' },
  { id: 'volumes_modulacao', label: 'Volumes Modulação' },
];

export function emptyChecklist(): AccessoryChecklistItem[] {
  return CHECKLIST_ITEMS_CONFIG.map((item) => ({
    id: item.id,
    label: item.label,
    conferido: false,
    qtd: 0,
    local: '',
  }));
}

export function emptyOperacional(): OperationalStatus {
  return {
    embalagem: {
      inicio: '',
      fim: '',
      pausa: false,
      responsavelId: '',
      responsavelNome: '',
    },
    prontoData: '',
    prontoResponsavelId: '',
    prontoResponsavelNome: '',
    entregaData: '',
    entregaResponsavelId: '',
    entregaResponsavelNome: '',
    almoxarifadoDataHora: '',
    pendencias: '',
    entregaParcial: false,
  };
}
