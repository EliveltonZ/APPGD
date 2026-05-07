import type { ProjectType, ProjectStatus, ProjectReleaseFormData } from '../types/pcp';

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  plano_corte:  'Plano de Corte',
  promob:       'Promob',
  plano_promob: 'Plano/Promob',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  disponivel:  'Disponível',
  em_lote:     'Em Lote',
  em_producao: 'Em Produção',
  concluido:   'Concluído',
};

export const ALL_PROJECT_TYPES: ProjectType[] = [
  'plano_corte', 'promob', 'plano_promob',
];

export function emptyProjectRelease(): ProjectReleaseFormData {
  return {
    numOC:         '',
    contrato:      '',
    cliente:       '',
    urgente:       false,
    corteCC:       '',
    ambiente:      '',
    numProjeto:    '',
    pedido:        '',
    tipo:          'promob',
    pecas:         0,
    area:          0,
    lote:          '',
    chegouFabrica: '',
    entrega:       '',
  };
}
