import { apiGet } from './api';

export interface DashboardRecord {
  id: number;
  ambiente: string;
  vendedor: string;
  liberador: string;
  loja: number;
  loja_nome: string | null;
  pronto: string; // YYYY-MM-DD
  mes: string;   // YYYY-MM
}

export interface ProductionRecord {
  cliente: string;
  ambiente: string;
  status: string;
}

export async function fetchDashProjetos(): Promise<DashboardRecord[]> {
  return apiGet<DashboardRecord[]>('/dashboard/projetos');
}

export async function fetchDashProducao(): Promise<ProductionRecord[]> {
  return apiGet<ProductionRecord[]>('/dashboard/producao');
}

export interface EtapaRow {
  corteinicio:        string | null; cortefim:        string | null;
  customizacaoinicio: string | null; customizacaofim: string | null;
  coladeirainicio:    string | null; coladeirafim:    string | null;
  usinageminicio:     string | null; usinagemfim:     string | null;
  montageminicio:     string | null; montagemfim:     string | null;
  paineisinicio:      string | null; paineisfim:      string | null;
  embalageminicio:    string | null; embalagemfim:    string | null;
  acabamentoinicio:   string | null; acabamentofim:   string | null;
}

export interface ProducaoDetalhada {
  totalEmProd:    number;
  urgentesEmProd: number;
  statusDist:     { name: string; value: number }[];
  esteiraViva:    { name: string; aguardando: number; iniciado: number; finalizado: number }[];
  etapaRows:      EtapaRow[];
  leadTimePorMes: { mes: string; avgDias: number; total: number }[];
  onTimePorMes:   { mes: string; noPrazo: number; atrasado: number; total: number }[];
}

export async function fetchDashProducaoDetalhada(start: string, end: string): Promise<ProducaoDetalhada> {
  return apiGet<ProducaoDetalhada>('/dashboard/producao-detalhada', { start, end });
}
