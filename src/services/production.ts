import {
  mockOrders,
  mockDetails,
  mockEmployees,
} from '../data/productionMocks';
import type { ProductionOrder, ProductionDetail, Employee } from '../types/production';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function fetchProductionOrders(): Promise<ProductionOrder[]> {
  await delay(600);
  return mockOrders;
}

export async function fetchProductionDetail(orderId: number): Promise<ProductionDetail | null> {
  await delay(300);
  return mockDetails[orderId] ?? null;
}

export async function fetchEmployees(): Promise<Employee[]> {
  await delay(400);
  return mockEmployees;
}