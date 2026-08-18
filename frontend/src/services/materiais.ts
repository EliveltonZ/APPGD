import { apiGet, apiPost, apiPut, apiDelete } from './api';

export interface Material {
  id: number;
  codigoInterno: string;
  descricao: string;
  unidadeBase: 'M2' | 'UN';
  espessura: number | null;
  m2PorUnidade: number | null;
  ultimoPrecoUn: number | null;
  dataUltimoPreco: string | null;
  estoqueMinimoUn: number | null;
  ativo: boolean;
}

export interface MaterialPayload {
  codigo_interno: string;
  descricao: string;
  unidade_base: 'M2' | 'UN';
  espessura: number | null;
  m2_por_unidade: number | null;
  estoque_minimo_un: number | null;
  ativo: boolean;
}

export const fetchMateriais        = (): Promise<Material[]>       => apiGet('/materiais');
export const createMaterial        = (p: MaterialPayload)          => apiPost('/materiais', p);
export const updateMaterial        = (id: number, p: MaterialPayload) => apiPut(`/materiais/${id}`, p);
export const deleteMaterial        = (id: number)                  => apiDelete(`/materiais/${id}`);
