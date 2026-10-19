import { apiGet, apiPost, apiPut, apiDelete } from './api';

export interface NotaFiscalResumo {
  id: number;
  numero_nota: string;
  data_emissao: string | null;
  data_entrada: string;
  valor_total: number | null;
  observacoes: string | null;
  fornecedor_nome: string;
  usuario_login: string;
  total_itens: number;
}

export interface NotaFiscalItem {
  id: number;
  nota_fiscal_id: number;
  codigo_nf: string | null;
  material_id: number;
  descricao_nf: string | null;
  unidade_compra: string;
  qtd_nf: number;
  qtd_un: number;
  preco_nf: number | null;
  preco_un: number | null;
  total: number | null;
  codigo_interno: string;
  material_descricao: string;
}

export interface NotaFiscalItemPayload {
  materialId: number;
  codigoNf: string | null;
  descricaoNf: string | null;
  unidadeCompra: string;
  qtdNf: number;
  qtdUn: number;
  precoNf: number | null;
  precoUn: number | null;
  salvarVinculo: boolean;
  fator: number | null;
  pedidoItemId?: number | null;
}

export interface NotaFiscalPayload {
  fornecedorId: number;
  numeroNota: string;
  dataEmissao: string | null;
  dataEntrada: string;
  observacoes: string | null;
  itens: NotaFiscalItemPayload[];
  chave?: string | null;
}

export interface VinculoCodigoNF {
  id: number;
  materialId: number;
  fornecedorId: number;
  codigoNf: string;
  unidadeCompra: string;
  m2PorUnidade: number | null;
}

export const fetchNotasFiscais = (): Promise<NotaFiscalResumo[]> =>
  apiGet('/nota-fiscal');

export const fetchItensNota = (id: number): Promise<NotaFiscalItem[]> =>
  apiGet(`/nota-fiscal/${id}/itens`);

export const criarNotaFiscal = (payload: NotaFiscalPayload): Promise<{ id: number }> =>
  apiPost('/nota-fiscal', payload);

export const fetchVinculo = (materialId: number, fornecedorId: number): Promise<VinculoCodigoNF | null> =>
  apiGet(`/nota-fiscal/vinculo/${materialId}/${fornecedorId}`);

// Consulta e correção de vínculos já salvos — pra quando o time vincula um
// item errado (material errado, ou fator errado) durante o lançamento de
// uma nota e precisa achar e corrigir depois.
export interface VinculoListItem {
  id: number;
  material_id: number;
  fornecedor_id: number;
  codigo_nf: string;
  unidade_compra: string;
  m2_por_unidade: number | null;
  codigo_interno: string;
  material_descricao: string;
  unidade_base: string;
  fornecedor_nome: string;
}

export const fetchVinculos = (): Promise<VinculoListItem[]> =>
  apiGet('/nota-fiscal/vinculos');

export interface VinculoUpdatePayload {
  material_id?: number;
  unidade_compra?: string;
  m2_por_unidade: number | null;
}

export const atualizarVinculo = (id: number, payload: VinculoUpdatePayload): Promise<VinculoCodigoNF> =>
  apiPut(`/nota-fiscal/vinculos/${id}`, payload);

export const excluirVinculo = (id: number): Promise<void> =>
  apiDelete(`/nota-fiscal/vinculos/${id}`);

// Prévia da leitura de um XML de NF-e — nada é gravado, só o parse + o
// casamento de fornecedor (por CNPJ) e itens (por vínculo já salvo).
export interface NFePreviewFornecedor {
  id: number | null;
  cnpj: string | null;
  nome: string | null;
  inscricaoEstadual: string | null;
  endereco: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  cep: string | null;
  estado: string | null;
}

export interface NFePreviewItem {
  codigoNf: string | null;
  descricao: string | null;
  unidadeCompra: string | null;
  qtdNf: number | null;
  precoNf: number | null;
  total: number | null;
  materialId: number | null;
  codigoInterno: string | null;
  materialDescricao: string | null;
  fator: number | null;
}

export interface NFePreviewDuplicata {
  id: number;
  numeroNota: string;
  dataEntrada: string;
}

export interface NFePreview {
  chave: string | null;
  numeroNota: string | null;
  dataEmissao: string | null;
  dataEntrada: string | null;
  valorTotal: number | null;
  duplicata: NFePreviewDuplicata | null;
  fornecedor: NFePreviewFornecedor;
  itens: NFePreviewItem[];
}

export const previewNotaFiscalXml = (xml: string): Promise<NFePreview> =>
  apiPost('/nota-fiscal/xml/preview', { xml });
