import { apiGet, apiPost, apiPut, apiDelete } from './api';

export type Deposito = 'ALMOXARIFADO' | 'FABRICA' | 'EXPEDICAO';

export interface Localizacao {
  id: number;
  codigo: string;
  descricao: string | null;
  ativo: boolean;
  rua: string;
  prateleira: string;
  nivel: string;
  divisao: string;
  padraoRecebimento: boolean;
  deposito: Deposito;
}

export interface LocalizacaoPayload {
  descricao: string | null;
  ativo: boolean;
  rua: string;
  prateleira: string;
  nivel: string;
  divisao: string;
  padrao_recebimento: boolean;
  deposito: Deposito;
}

export const fetchLocalizacoes   = (): Promise<Localizacao[]>              => apiGet('/localizacoes');
export const fetchRecebimento    = (): Promise<Localizacao | null>         => apiGet('/localizacoes/recebimento');
export const createLocalizacao   = (p: LocalizacaoPayload)                 => apiPost('/localizacoes', p);
export const updateLocalizacao   = (id: number, p: LocalizacaoPayload)     => apiPut(`/localizacoes/${id}`, p);
export const deleteLocalizacao   = (id: number)                            => apiDelete(`/localizacoes/${id}`);
