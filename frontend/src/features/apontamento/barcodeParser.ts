import type { StageId } from './types';

// Mapeamento: dois dígitos do barcode → StageId
const STAGE_BY_CODE: Record<string, StageId> = {
  '02': 'corte',
  '03': 'customizacao',
  '04': 'coladeira',
  '05': 'usinagem',
  '06': 'montagem',
  '07': 'paineis',
  '08': 'embalagem',
  '09': 'acabamento',
};

export type BarcodeResult =
  | { type: 'pedido'; pedido: number }
  | { type: 'stage'; pedido: number; stageId: StageId; action: 'iniciar' | 'finalizar' };

/**
 * Interpreta um código de barras lido pelo leitor.
 *
 * Formatos esperados:
 *   004637        → busca pelo pedido 4637
 *   004637021     → início (1) de corte (02) do pedido 4637
 *   004637022     → fim   (2) de corte (02) do pedido 4637
 *   004637031/032 → customizacao  041/042 → coladeira
 *   051/052 → usinagem  061/062 → montagem  071/072 → paineis
 *   081/082 → embalagem  091/092 → acabamento
 */
export function parseBarcode(raw: string): BarcodeResult | null {
  const code = raw.trim();
  if (!/^\d+$/.test(code)) return null;

  // 9 dígitos: XXXXXXYYZ
  if (code.length === 9) {
    const pedido    = parseInt(code.slice(0, 6), 10);
    const stageCode = code.slice(6, 8);
    const actCode   = code.slice(8);
    const stageId   = STAGE_BY_CODE[stageCode];
    if (!stageId) return null;
    if (actCode !== '1' && actCode !== '2') return null;
    return {
      type: 'stage',
      pedido,
      stageId,
      action: actCode === '1' ? 'iniciar' : 'finalizar',
    };
  }

  // 4–6 dígitos: pedido
  if (code.length >= 4 && code.length <= 6) {
    return { type: 'pedido', pedido: parseInt(code, 10) };
  }

  return null;
}
