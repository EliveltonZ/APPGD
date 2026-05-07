import { mockProjectValues } from '../data/financeiroMocks';
import type { ProjectValue } from '../types/financeiro';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function fetchProjectValues(): Promise<ProjectValue[]> {
  await delay(600);
  return mockProjectValues;
}