// kept for reference; select values are now numeric codes (smallint) from get_config
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
  falha: string;        // display label (full text description)
  falhaId: number;      // DB ID → p_falha smallint
  tipo: string;         // descrição da ocorrência para exibição
  ocorrenciaId: number; // DB ID → p_ocorrencia smallint
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
  dataHora: string;          // ISO 8601 timestamp
  situacao: RequestSituation;

  cliente: string;
  ambiente: string;
  bairro: string;

  supervisor: string;
  liberador: string;
  tipoSolicitacao: string;  // numeric cod from get_config, stored as string (Select value)
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
  tipo: string;
  observacoes: string;
}