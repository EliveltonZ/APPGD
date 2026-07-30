export type ExpeditionStatus =
  | "AGUARDANDO"
  | "INICIADO"
  | "PRONTO"
  | "ATRASADO"
  | "ENTREGUE"
  | "A VENCER"
  | "PARCEADO"
  | "URGENTE"
  | "PENDENCIA";

export interface ExpeditionOrder {
  total: number;
  a: string;
  ordemdecompra: number;
  pedido: number;
  etapa: string;
  codcc: number;
  cliente: string;
  contrato: number;
  numproj: string;
  ambiente: string;
  tipo: string;
  chegoufabrica: string | null;
  dataentrega: string | null;
  lote: number;
  status: ExpeditionStatus;
  iniciado: string | null;
  pronto: string | null;
  entrega: string | null;
}

export interface ExpeditionDetail {
  // read-only identification
  ordemdecompra: number;
  cliente: string;
  contrato: number;
  codcc: number;
  ambiente: string;
  numproj: string;
  lote: number;
  chegoufabrica: string;   // ISO date
  dataentrega: string;     // ISO date
  etapa: boolean;
  acessoriosPendentes: number;
  // tblProjetos (editable)
  pronto: string;          // ISO date
  entrega: string;         // ISO date
  pendencia: boolean;
  parcial: boolean;
  // tblProducao (editable)
  separacao: string;       // ISO datetime-local
  conferido: number;
  conferidoname: string;
  motorista: number;
  motoristaname: string;
  embalageminicio: string; // ISO datetime-local
  embalagemfim: string;    // ISO datetime-local
  embalagempausa: boolean;
  embalagemresp: number;
  embalagemname: string;
  tamanho: string;
  observacoes: string;
  totalvolumes: number;
  // tblAvulsos (editable)
  avulso: boolean; avulsol: string; avulsoq: number;
  cabide: boolean; cabidel: string; cabideq: number;
  paineis: boolean; paineisl: string; paineisq: number;
  pecaspintadas: boolean; pecaspintadasl: string; pecaspintadasq: number;
  portaaluminio: boolean; portaaluminiol: string; portaaluminioq: number;
  serralheria: boolean; serralherial: string; serralheriaq: number;
  tapecaria: boolean; tapecarial: string; tapecariaq: number;
  trilho: boolean; trilhol: string; trilhoq: number;
  vidros: boolean; vidrosl: string; vidrosq: number;
  volmod: boolean; modulosl: string; modulosq: number;
  // pending accessories
  acessoriosCompra: PendingAccessory[];
}

export interface PendingAccessory {
  id: string;
  descricao: string;
  medida: string;
  qtd: number;
  compra: string;
  previsao: string;
  recebido: string;
}

export interface ExpeditionUser {
  id: string;
  nome: string;
}
