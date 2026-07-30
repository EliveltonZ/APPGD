/**
 * Utilitário de tempo produtivo.
 *
 * Calcula minutos trabalhados entre dois instantes levando em conta
 * somente o janela de produção configurada (horário + dias úteis).
 *
 * Não conta feriados além dos informados explicitamente — adicione datas
 * ao array `holidays` do schedule quando necessário.
 */

export interface WorkSchedule {
  /** Início do expediente em minutos desde meia-noite (ex: 07:30 → 450). */
  startMins: number;
  /** Fim do expediente em minutos desde meia-noite (ex: 16:00 → 960). */
  endMins: number;
  /** Dias úteis: 0 = Dom … 6 = Sáb. Padrão: Seg–Sex. */
  workDays: readonly number[];
  /** Datas de feriado — qualquer horário nesses dias é desconsiderado. */
  holidays?: readonly Date[];
}

/** Horário padrão da fábrica: 07:30–16:00, Seg–Sex, sem feriados. */
export const FACTORY_SCHEDULE: WorkSchedule = {
  startMins: 7 * 60 + 30, // 450 min
  endMins: 16 * 60 + 30, // 960 min
  workDays: [1, 2, 3, 4, 5],
};

// ── Helpers internos ────────────────────────────────────────────────────────

function midnightMs(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function toDate(v: Date | string | null | undefined): Date | null {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

// ── API pública ─────────────────────────────────────────────────────────────

/**
 * Retorna o número de minutos produtivos entre `start` e `end`.
 * Conta apenas o tempo dentro da janela de expediente de cada dia útil.
 *
 * Regra de sábado: sábado só é contabilizado quando o próprio `start` cair
 * em sábado (hora extra). Se o período apenas atravessa um sábado sem ter
 * começado nele, esse sábado é ignorado.
 *
 * @param start  Data/hora de início (Date, ISO string ou null)
 * @param end    Data/hora de fim    (Date, ISO string ou null)
 * @param schedule  Configuração de horário; padrão: FACTORY_SCHEDULE
 * @returns Minutos inteiros >= 0
 *
 * @example
 * // Começa 16:00 sexta, termina 08:00 segunda → 30min (só 07:30–08:00 da segunda)
 * calcWorkMinutes('2025-07-18T16:00', '2025-07-21T08:00') // → 30
 * // Começa sábado 08:00, termina sábado 12:00 → 240min (hora extra)
 * calcWorkMinutes('2025-07-19T08:00', '2025-07-19T12:00') // → 240
 */
export function calcWorkMinutes(
  start: Date | string | null | undefined,
  end: Date | string | null | undefined,
  schedule: WorkSchedule = FACTORY_SCHEDULE,
): number {
  const s = toDate(start);
  const e = toDate(end);
  if (!s || !e || s >= e) return 0;

  const holidays = new Set((schedule.holidays ?? []).map((h) => midnightMs(h)));
  const startDow = s.getDay(); // dia da semana do início (0=Dom … 6=Sáb)

  const sh = Math.floor(schedule.startMins / 60);
  const sm = schedule.startMins % 60;
  const eh = Math.floor(schedule.endMins / 60);
  const em = schedule.endMins % 60;

  let totalMs = 0;
  let cursor = new Date(s);
  let firstDay = true;

  while (cursor < e) {
    const dow = cursor.getDay();
    const isHoliday = holidays.has(midnightMs(cursor));

    // Sábado só entra no cálculo quando o período inteiro começou num sábado.
    const isSaturdayOvertime = firstDay && startDow === 6 && dow === 6 && !isHoliday;
    const isRegularWorkDay   = schedule.workDays.includes(dow) && !isHoliday;

    if (!isSaturdayOvertime && !isRegularWorkDay) {
      cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1, sh, sm, 0, 0);
      firstDay = false;
      continue;
    }

    // Janela de trabalho deste dia
    const wStart = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), sh, sm, 0, 0);
    const wEnd   = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), eh, em, 0, 0);

    // Segmento efetivo: interseção de [cursor, e) com [wStart, wEnd)
    const segStart = cursor > wStart ? cursor : wStart;
    const segEnd   = e < wEnd ? e : wEnd;

    if (segStart < segEnd) {
      totalMs += segEnd.getTime() - segStart.getTime();
    }

    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1, sh, sm, 0, 0);
    firstDay = false;
  }

  return Math.round(totalMs / 60_000);
}

/**
 * Formata minutos produtivos para exibição.
 *
 * @example
 * fmtWorkDuration(0)   // "—"
 * fmtWorkDuration(45)  // "45min"
 * fmtWorkDuration(90)  // "1h 30min"
 * fmtWorkDuration(120) // "2h"
 */
export function fmtWorkDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

/**
 * Minutos de expediente por dia útil no schedule informado.
 * Útil para calcular metas e médias.
 *
 * @example
 * workMinsPerDay() // 510 (8h30min com horário padrão)
 */
export function workMinsPerDay(
  schedule: WorkSchedule = FACTORY_SCHEDULE,
): number {
  return schedule.endMins - schedule.startMins;
}
