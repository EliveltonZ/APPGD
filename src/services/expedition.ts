import {
  mockExpeditionOrders,
  mockExpeditionDetails,
  mockExpeditionUsers,
} from '../data/expeditionMocks';
import type {
  ExpeditionOrder,
  ExpeditionDetail,
  ExpeditionUser,
} from '../types/expedition';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function fetchExpeditionOrders(): Promise<ExpeditionOrder[]> {
  await delay(600);
  return mockExpeditionOrders;
}

export async function fetchExpeditionDetail(orderId: number): Promise<ExpeditionDetail | null> {
  await delay(300);
  return mockExpeditionDetails[orderId] ?? null;
}

export async function fetchExpeditionUsers(): Promise<ExpeditionUser[]> {
  await delay(400);
  return mockExpeditionUsers;
}