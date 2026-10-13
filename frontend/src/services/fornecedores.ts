import { apiGet, apiPost, apiPut, apiDelete } from './api';

export interface Fornecedor {
  id: number;
  nome: string;
  cnpj: string | null;
  contato: string | null;
  ativo: boolean;
}

export interface FornecedorPayload {
  nome: string;
  cnpj: string | null;
  contato: string | null;
  ativo: boolean;
}

export const fetchFornecedores = (): Promise<Fornecedor[]>               => apiGet('/fornecedores');
export const createFornecedor   = (p: FornecedorPayload)                 => apiPost('/fornecedores', p);
export const updateFornecedor   = (id: number, p: FornecedorPayload)     => apiPut(`/fornecedores/${id}`, p);
export const deleteFornecedor   = (id: number)                           => apiDelete(`/fornecedores/${id}`);
