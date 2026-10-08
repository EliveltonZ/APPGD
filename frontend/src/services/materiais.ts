import { apiGet, apiPost, apiPut, apiDelete } from './api';

export interface Material {
  id: number;
  codigoInterno: string;
  descricao: string;
  unidadeBase: 'M2' | 'UN';
  m2PorUnidade: number | null;
  ultimoPrecoUn: number | null;
  dataUltimoPreco: string | null;
  estoqueMinimoUn: number | null;
  ativo: boolean;
  cadastroRevisado: boolean;
}

export interface MaterialPayload {
  codigo_interno: string;
  descricao: string;
  unidade_base: 'M2' | 'UN';
  m2_por_unidade: number | null;
  estoque_minimo_un: number | null;
  ativo: boolean;
  cadastro_revisado: boolean;
}

export interface MaterialOpcao {
  id: number;
  codigoInterno: string;
  descricao: string;
  unidadeBase: 'M2' | 'M' | 'UN';
}

export const fetchMateriais        = (): Promise<Material[]>       => apiGet('/materiais');
// Lista leve (sem preço), sem exigir a permissão de cadastro — pra seletores.
export const fetchMateriaisOpcoes  = (): Promise<MaterialOpcao[]>   => apiGet('/materiais/opcoes');
export const createMaterial        = (p: MaterialPayload)          => apiPost('/materiais', p);
export const updateMaterial        = (id: number, p: MaterialPayload) => apiPut(`/materiais/${id}`, p);
export const deleteMaterial        = (id: number)                  => apiDelete(`/materiais/${id}`);
