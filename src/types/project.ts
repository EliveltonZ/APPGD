export interface Client {
  id: string;
  nome: string;
  tipo: string;
  documento?: string;
  telefone?: string;
  email?: string;
}

export interface ContractLookupResult {
  numOC?: string;
  numeroProjeto?: string;
  tipoContrato?: number;
  etapa?: string;
  clienteId?: string;
  clienteNome?: string;
  clienteTipo?: string;
  vendedor?: number;
  liberador?: number;
  loja?: number;
  tipoAmbiente?: number;
  ambiente?: string;
  dataContrato?: string;
  dataAssinatura?: string;
  dataEntrega?: string;
  valorBruto?: string;
  valorNegociado?: string;
}

export interface ProjectFormData {
  // 1 — Identificação
  contrato: string;
  numOC: string;
  numeroProjeto: string;
  tipoContrato: number;
  etapa: string;
  // 2 — Cliente
  clienteId: string;
  clienteNome: string;
  clienteTipo: string;
  // 3 — Comercial
  vendedor: number;
  liberador: number;
  loja: number;
  // 4 — Ambiente
  tipoAmbiente: number;
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
}

export function emptyProjectForm(): ProjectFormData {
  return {
    contrato: "",
    numOC: "",
    numeroProjeto: "",
    tipoContrato: 0,
    etapa: "",
    clienteId: "",
    clienteNome: "",
    clienteTipo: "",
    vendedor: 0,
    liberador: 0,
    loja: 0,
    tipoAmbiente: 0,
    ambiente: "",
    dataContrato: "",
    dataAssinatura: "",
    chegouFabrica: "",
    dataEntrega: "",
    valorBruto: "",
    valorNegociado: "",
    custoMaterial: "",
    custoAdicional: "",
  };
}

export type ProjectFormErrors = Partial<Record<keyof ProjectFormData, string>>;

export interface SectionProps {
  form: ProjectFormData;
  onChange: (field: keyof ProjectFormData, value: string) => void;
  errors?: ProjectFormErrors;
}
