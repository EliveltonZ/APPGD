import { apiGet, apiPost } from './api';

export interface SaldoLocalizacao {
  localizacao_id: number;
  codigo: string;
  descricao: string | null;
  saldo: number;
}

export interface Transferencia {
  id: number;
  data: string;
  qtd_un: number;
  observacoes: string | null;
  codigo_interno: string;
  material_descricao: string;
  origem_codigo: string;
  origem_descricao: string | null;
  destino_codigo: string;
  destino_descricao: string | null;
  usuario_login: string;
}

export interface NovaTransferenciaPayload {
  material_id:             number;
  localizacao_origem_id:   number;
  localizacao_destino_id:  number;
  qtd_un:                  number;
  data:                    string;
  observacoes:             string | null;
}

export const fetchSaldoMaterial   = (materialId: number): Promise<SaldoLocalizacao[]> =>
  apiGet(`/transferencias/saldo/${materialId}`);

export const fetchTransferencias   = (): Promise<Transferencia[]> =>
  apiGet('/transferencias');

export const criarTransferencia = (payload: NovaTransferenciaPayload): Promise<{ id: number }> =>
  apiPost('/transferencias', payload);
