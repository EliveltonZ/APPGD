import { apiGet, apiPost, apiPut, apiDelete } from './api';

export interface Fornecedor {
  id: number;
  nome: string;
  cnpj: string | null;
  contato: string | null;
  ativo: boolean;
  inscricaoEstadual: string | null;
  endereco: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  cep: string | null;
  estado: string | null;
}

export interface FornecedorPayload {
  nome: string;
  cnpj: string | null;
  contato: string | null;
  ativo: boolean;
  inscricao_estadual: string | null;
  endereco: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  cep: string | null;
  estado: string | null;
}

export const fetchFornecedores = (): Promise<Fornecedor[]>               => apiGet('/fornecedores');
export const createFornecedor   = (p: FornecedorPayload)                 => apiPost('/fornecedores', p);
export const updateFornecedor   = (id: number, p: FornecedorPayload)     => apiPut(`/fornecedores/${id}`, p);
export const deleteFornecedor   = (id: number)                           => apiDelete(`/fornecedores/${id}`);
