import { mockStatusProjects } from '../data/statusMocks';
import type { StatusProject } from '../types/status';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function fetchStatusProjects(): Promise<StatusProject[]> {
  await delay(600);
  return mockStatusProjects;
}