export type StageId =
  | 'corte'
  | 'customizacao'
  | 'coladeira'
  | 'usinagem'
  | 'paineis'
  | 'montagem'
  | 'acabamento'
  | 'embalagem';

export type StageStatus = 'nao_iniciado' | 'em_andamento' | 'pausado' | 'finalizado';
export type ProjectStatus = 'aguardando' | 'em_producao' | 'pausado' | 'concluido' | 'atrasado';
export type StageAction = 'iniciar' | 'pausar' | 'retomar' | 'finalizar';

export const STAGE_ORDER: StageId[] = [
  'corte', 'customizacao', 'coladeira', 'usinagem',
  'paineis', 'montagem', 'acabamento', 'embalagem',
];

export interface Stage {
  id: StageId;
  label: string;
  order: number;
  status: StageStatus;
  inicio: string | null;
  fim: string | null;
  pausa: boolean;
  responsavelId: string | null;
  responsavelNome: string | null;
}

export interface PendingMaterial {
  id: string;
  categoria: string;
  descricao: string;
  medida: string;
  qtd: number;
  datacompra: string | null;
  previsao: string | null;
  recebido: string | null;
}

export interface ApontamentoProject {
  ordemdecompra: number;
  pedido: number;
  contrato: string;
  cliente: string;
  ambiente: string;
  codcc: string;
  numproj: string;
  lote: string;
  chegoufabrica: string | null;
  dataentrega: string | null;
  previsao: string | null;
  iniciado: string | null;
  pronto: string | null;
  observacoes: string | null;
  status: ProjectStatus;
  etapas: Record<StageId, Stage>;
  materiais: PendingMaterial[];
}

export interface Operator {
  id: string;
  nome: string;
}
