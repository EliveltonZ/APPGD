export const DASH_STATUS: StatusProd[] = [
  "A VENCER",
  "ATRASADO",
  "INICIADO",
  "PENDENCIA",
];

type Status = "AGUARDE" | "INICADO" | "FINALIZADO";
export type StatusProd = "A VENCER" | "ATRASADO" | "INICIADO" | "PENDENCIA";

type Project = {
  cliente: string;
  ambiente: string;
  status: StatusProd;
  corte: Status;
  coladeira: Status;
  customizacao: Status;
  paineis: Status;
  usinagem: Status;
  montagem: Status;
  embalagem: Status;
};

export const DASH_PRODUCTION: Project[] = [
  {
    cliente: "ANTONIO FONSECA",
    ambiente: "Produção",
    status: "INICIADO",
    corte: "FINALIZADO",
    coladeira: "INICADO",
    customizacao: "AGUARDE",
    paineis: "FINALIZADO",
    usinagem: "INICADO",
    montagem: "FINALIZADO",
    embalagem: "AGUARDE",
  },
  {
    cliente: "ALINE ARAUJO",
    ambiente: "Desenvolvimento",
    status: "PENDENCIA",
    corte: "INICADO",
    coladeira: "INICADO",
    customizacao: "FINALIZADO",
    paineis: "FINALIZADO",
    usinagem: "INICADO",
    montagem: "FINALIZADO",
    embalagem: "FINALIZADO",
  },
  {
    cliente: "PEDRO MANDELA",
    ambiente: "Teste",
    status: "ATRASADO",
    corte: "INICADO",
    coladeira: "INICADO",
    customizacao: "INICADO",
    paineis: "AGUARDE",
    usinagem: "INICADO",
    montagem: "INICADO",
    embalagem: "FINALIZADO",
  },
  {
    cliente: "AUGUSTO VIANNA",
    ambiente: "Produção",
    status: "A VENCER",
    corte: "AGUARDE",
    coladeira: "AGUARDE",
    customizacao: "INICADO",
    paineis: "INICADO",
    usinagem: "FINALIZADO",
    montagem: "AGUARDE",
    embalagem: "INICADO",
  },

  {
    cliente: "AUGUSTO VIANNA",
    ambiente: "Produção",
    status: "A VENCER",
    corte: "AGUARDE",
    coladeira: "AGUARDE",
    customizacao: "INICADO",
    paineis: "INICADO",
    usinagem: "FINALIZADO",
    montagem: "AGUARDE",
    embalagem: "INICADO",
  },
];
