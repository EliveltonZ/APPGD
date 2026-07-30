/** "2024-01-15" or "2024-01-15T..." → "15/01/2024". Returns "" for null/empty.
 *  Usa parse de string (não new Date) para evitar virada de data em UTC-3. */
export function fmtDate(val: string | null | undefined): string {
  if (!val) return "";
  const m = val.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return val;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

/** "2024-01-15T11:55:00.000Z" → "15/01/2024 08:55" (horário local). Returns "" for null/empty. */
export function fmtDateTime(val: string | null | undefined): string {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  const dd   = String(d.getDate()).padStart(2, "0");
  const mm   = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh   = String(d.getHours()).padStart(2, "0");
  const min  = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

/** Trunca para "yyyy-MM-dd" para <input type="date">.
 *  Usa slice (não new Date) para evitar virada de data em UTC-3. */
export function toDateInput(val: unknown): string {
  if (!val) return "";
  return String(val).slice(0, 10);
}

/** Retorna "yyyy-MM-dd" no fuso local (evita virada de dia UTC às 21h BRT). */
export function localDateStr(date: Date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm   = String(date.getMonth() + 1).padStart(2, "0");
  const dd   = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Converte ISO UTC → "yyyy-MM-ddTHH:mm" em horário local para <input type="datetime-local">. */
export function toDatetimeLocal(val: unknown): string {
  if (!val) return "";
  const d = new Date(String(val));
  if (isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, "0");
  const dd   = String(d.getDate()).padStart(2, "0");
  const hh   = String(d.getHours()).padStart(2, "0");
  const min  = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}
