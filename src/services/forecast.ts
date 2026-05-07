import { mockForecastProjects } from '../data/forecastMocks';
import type { ForecastProject } from '../types/forecast';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function fetchForecastProjects(): Promise<ForecastProject[]> {
  await delay(600);
  return mockForecastProjects;
}