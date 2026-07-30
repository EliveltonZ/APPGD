export interface Material {
  id: string;
  categoria?: string;
  descricao: string;
  medida: string;
  qtd: number;
  compra: string;    // ISO date — MaterialsTable converte para pt-BR
  previsao: string;  // ISO date — MaterialsTable converte para pt-BR
  recebido: string;  // ISO date — usado para checar status (recebido/pendente)
}

export interface Stage {
  inicio: string;
  fim: string;
  pausa?: string;
  responsavel: string;
  status: StageStatus;
}

export type StageStatus =
  | "nao_iniciado"
  | "em_andamento"
  | "pausado"
  | "concluido";
