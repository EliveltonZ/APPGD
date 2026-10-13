import { apiGet, apiPost } from './api';

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
}

export interface NotaFiscalPayload {
  fornecedorId: number;
  numeroNota: string;
  dataEmissao: string | null;
  dataEntrada: string;
  localizacaoId: number;
  observacoes: string | null;
  itens: NotaFiscalItemPayload[];
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
