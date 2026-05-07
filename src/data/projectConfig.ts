import type { SelectOption } from "../components/Select";

export const CONTRACT_TYPE_OPTIONS: SelectOption[] = [
  { value: "direto", label: "Contrato Direto" },
  { value: "terceirizado", label: "Terceirizado" },
  { value: "licitacao", label: "Licitação" },
  { value: "comodato", label: "Comodato" },
];

export const PROJECT_STAGE_OPTIONS: SelectOption[] = [
  { value: "proposta", label: "Proposta" },
  { value: "aprovado", label: "Aprovado" },
  { value: "producao", label: "Em Produção" },
  { value: "concluido", label: "Concluído" },
  { value: "cancelado", label: "Cancelado" },
];

export const CLIENT_TYPE_OPTIONS: SelectOption[] = [
  { value: 1, label: "Pessoa Física" },
  { value: 2, label: "Pessoa Jurídica" },
];

export const AMBIENT_TYPE_OPTIONS: SelectOption[] = [
  { value: 1, label: "AREA DE SERVICO" },
  { value: 2, label: "COZINHA" },
  { value: 3, label: "DORMITORIO CASAL" },
  { value: 4, label: "DORMITORIO SOLTEIRO" },
  { value: 5, label: "HALL DE ENTRADA" },
];

export const VENDEDOR_TYPE_OPTIONS: SelectOption[] = [
  { value: 1, label: "ANDREIA DESSIA" },
  { value: 2, label: "ELIAN VIEIRA" },
  { value: 3, label: "JANE RODRIGUES" },
  { value: 4, label: "INES ROSSINI" },
  { value: 5, label: "KISSELA DASSOW" },
];

export const LIBERADOR_TYPE_OPTIONS: SelectOption[] = [
  { value: 1, label: "ALBERTO GOUDNER" },
  { value: 2, label: "BERNNER RODRIGUES" },
  { value: 3, label: "LARISSA GABRIELA" },
  { value: 4, label: "MANUELA NUNES" },
  { value: 5, label: "THAYS CAMPOS" },
];

export const SHOP_TYPE_OPTIONS: SelectOption[] = [
  { value: 420, label: "GD MIGUEL" },
  { value: 421, label: "GD CURSINO" },
  { value: 422, label: "MUDY MOVEIS" },
];
