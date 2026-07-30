import type { MarginStatus, ProjectValue, FinancialSummary } from '../types/financeiro';

export function calcDescPct(bruto: number, negociado: number): number {
  if (!bruto) return 0;
  return ((bruto - negociado) / bruto) * 100;
}

export function calcLucroBruto(negociado: number, material: number): number {
  return negociado - material;
}

export function calcMargem(lucroBruto: number, negociado: number): number {
  if (!negociado) return 0;
  return (lucroBruto / negociado) * 100;
}

export function getMarginStatus(margem: number): MarginStatus {
  if (margem < 0) return 'negative';
  if (margem < 15) return 'low';
  if (margem < 25) return 'medium';
  return 'healthy';
}

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatPct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

type RawProject = Omit<ProjectValue, 'descPct' | 'lucroBruto' | 'margem' | 'marginStatus'>;

export function buildProjectValue(raw: RawProject): ProjectValue {
  const lucroBruto = calcLucroBruto(raw.negociado, raw.material);
  const descPct = calcDescPct(raw.bruto, raw.negociado);
  const margem = calcMargem(lucroBruto, raw.negociado);
  const marginStatus = getMarginStatus(margem);
  return { ...raw, lucroBruto, descPct, margem, marginStatus };
}

export function calcSummary(rows: ProjectValue[]): FinancialSummary {
  if (!rows.length) {
    return { count: 0, totalBruto: 0, totalNegociado: 0, totalMaterial: 0, totalLucroBruto: 0, margemMedia: 0 };
  }
  const totalBruto = rows.reduce((s, r) => s + r.bruto, 0);
  const totalNegociado = rows.reduce((s, r) => s + r.negociado, 0);
  const totalMaterial = rows.reduce((s, r) => s + r.material, 0);
  const totalLucroBruto = calcLucroBruto(totalNegociado, totalMaterial);
  const margemMedia = calcMargem(totalLucroBruto, totalNegociado);
  return { count: rows.length, totalBruto, totalNegociado, totalMaterial, totalLucroBruto, margemMedia };
}

export function applyFilters(
  rows: ProjectValue[],
  search: string,
  marginFilter: string,
): ProjectValue[] {
  const term = search.trim().toLowerCase();
  return rows.filter((r) => {
    if (term && !`${r.cliente} ${r.contrato} ${r.numOC}`.toLowerCase().includes(term)) return false;
    if (marginFilter !== 'all' && r.marginStatus !== marginFilter) return false;
    return true;
  });
}