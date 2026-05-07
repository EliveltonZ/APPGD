import { mockProductionProjects } from '../data/pcpMocks';
import type { ProductionProject } from '../types/pcp';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function fetchProductionProjects(): Promise<ProductionProject[]> {
  await delay(600);
  return mockProductionProjects;
}