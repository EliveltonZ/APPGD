import { mockPurchases } from '../data/purchasesMocks';
import type { Purchase } from '../types/purchases';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function fetchPurchases(): Promise<Purchase[]> {
  await delay(600);
  return mockPurchases;
}