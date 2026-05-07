import { MOCK_ASSISTENCIAS_PRODUCAO } from '../data/assistenciaProducaoMocks';
import type { AssistanceProduction } from '../types/assistenciaProducao';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function fetchAssistencias(): Promise<AssistanceProduction[]> {
  await delay(600);
  return MOCK_ASSISTENCIAS_PRODUCAO;
}