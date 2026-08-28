export interface Client {
  id: string;
  nome: string;
  tipo: string;
  documento?: string;
  telefone?: string;
  email?: string;
}

export interface ProjectFormData {
  // 1 — Identificação
  contrato: string;
  numOC: string;
  numeroProjeto: string;
  tipoContrato: string | number;
  etapa: string | number;
  // 2 — Cliente
  clienteId: string;
  clienteNome: string;
  clienteTipo: string;
  // 3 — Comercial
  vendedor: string | number;
  liberador: string | number;
  loja: string | number;
  // 4 — Ambiente
  tipoAmbiente: string | number;
  ambiente: string;
  // 5 — Cronograma
  dataContrato: string;
  dataAssinatura: string;
  chegouFabrica: string;
  dataEntrega: string;
  // 6 — Financeiro
  valorBruto: string;
  valorNegociado: string;
  custoMaterial: string;
  custoAdicional: string;
  // 7 — Tipo de projeto
  tipoProjeto: string;
  ocOrigem: string;
  motivoAssistencia: string;
  // 8 — Dados da Assistência
  supervisor: string;
  tipoSolicitacaoAssist: string | number;
  origemMontagem: boolean;
  origemPromob: boolean;
  origemCobrada: boolean;
  observacoesAssist: string;
  responsavel: string;
  idResponsavel: number | null;
  dataCriacao?: string;
  urgente: boolean;
}

export function emptyProjectForm(): ProjectFormData {
  return {
    contrato: "",
    numOC: "",
    numeroProjeto: "",
    tipoContrato: '',
    etapa: '',
    clienteId: "",
    clienteNome: "",
    clienteTipo: "",
    vendedor: '',
    liberador: '',
    loja: '',
    tipoAmbiente: '',
    ambiente: "",
    dataContrato: "",
    dataAssinatura: "",
    chegouFabrica: "",
    dataEntrega: "",
    valorBruto: "",
    valorNegociado: "",
    custoMaterial: "",
    custoAdicional: "",
    tipoProjeto: "PROJETO",
    ocOrigem: "",
    motivoAssistencia: "",
    supervisor: "",
    tipoSolicitacaoAssist: '',
    origemMontagem: false,
    origemPromob: false,
    origemCobrada: false,
    observacoesAssist: "",
    responsavel: "",
    idResponsavel: null,
    urgente: false,
  };
}

export type ProjectFormErrors = Partial<Record<keyof ProjectFormData, string>>;

export interface SectionProps {
  form: ProjectFormData;
  onChange: (field: keyof ProjectFormData, value: string | boolean | number) => void;
  errors?: ProjectFormErrors;
}
