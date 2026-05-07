export type RequestType =
  | 'montagem_finalizacao'
  | 'asteca_garantia'
  | 'itens_especiais_terceiro';

export type RequestDestination = 'fabrica' | 'logistica';

export type RequestSituation =
  | 'em_aberto'
  | 'em_andamento'
  | 'concluida'
  | 'cancelada';

export type PartSide =
  | 'inferior_direito'
  | 'superior_direito'
  | 'inferior_esquerdo'
  | 'superior_esquerdo';

export type PartType =
  | 'estrutural'
  | 'nao_estrutural'
  | 'acessorio'
  | 'terceiros';

export interface ServicePart {
  id: string;
  qtd: number;
  peca: string;
  dimensoes: string;
  cor: string;
  lado: PartSide | '';
  falha: string;
  tipo: PartType | '';
  observacoes: string;
}

export interface TeamMember {
  id: number;
  nome: string;
}

export interface ServiceRequest {
  numSolicitacao: string;
  numContrato: string;
  solicitante: string;
  dataHora: string;
  situacao: RequestSituation;

  cliente: string;
  ambiente: string;
  bairro: string;

  supervisor: string;
  liberador: string;
  tipoSolicitacao: RequestType | '';
  urgente: 'sim' | 'nao';
  tempo: string;
  destino: RequestDestination | '';

  origemMontagem: boolean;
  origemPromob: boolean;
  origemEntrega: boolean;
  origemCobrada: boolean;

  observacoes: string;
  equipe: TeamMember[];
  pecas: ServicePart[];
}

export interface PartFormData {
  qtd: string;
  peca: string;
  dimensoes: string;
  cor: string;
  lado: PartSide | '';
  falha: string;
  tipo: PartType | '';
  observacoes: string;
}