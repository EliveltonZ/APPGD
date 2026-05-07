import { mockPendingProjects } from '../data/pendingMocks';
import type { PendingProject } from '../types/pending';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function fetchPendingProjects(): Promise<PendingProject[]> {
  await delay(600);
  return mockPendingProjects;
}