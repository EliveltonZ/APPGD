export interface AssistData {
  numSolicitacao: string;
  numContrato: string;
  corte: string;
  pedido: string;
  cliente: string;
  ambiente: string;
  montador: string;
  solicitante: string;
  supervisor: string;
  responsavel: string;
  dataHora: string;
  urgente: string;
}

export interface Peca {
  codigo: number;
  qtd: number;
  peca: string;
  dimensoes: string;
  cor: string;
  lado: string;
  ocorrencia: string;
  falha: string;
  observacoes: string;
}
