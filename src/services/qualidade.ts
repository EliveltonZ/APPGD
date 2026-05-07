import { MOCK_QUALITY_ITEMS } from '../data/qualityControlMocks';
import type { QualityItem } from '../types/qualityControl';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function fetchQualityItems(): Promise<QualityItem[]> {
  await delay(600);
  return MOCK_QUALITY_ITEMS;
}