import { apiGet, apiPost, apiPut, apiDelete } from './api';

export interface Localizacao {
  id: number;
  codigo: string;
  descricao: string | null;
  ativo: boolean;
  rua: string;
  prateleira: string;
  nivel: string;
  divisao: string;
}

export interface LocalizacaoPayload {
  descricao: string | null;
  ativo: boolean;
  rua: string;
  prateleira: string;
  nivel: string;
  divisao: string;
}

export const fetchLocalizacoes   = (): Promise<Localizacao[]>              => apiGet('/localizacoes');
export const createLocalizacao   = (p: LocalizacaoPayload)                 => apiPost('/localizacoes', p);
export const updateLocalizacao   = (id: number, p: LocalizacaoPayload)     => apiPut(`/localizacoes/${id}`, p);
export const deleteLocalizacao   = (id: number)                            => apiDelete(`/localizacoes/${id}`);
