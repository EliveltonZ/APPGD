/**
 * Formats user keystrokes into "R$ X.XXX,00".
 * Strips non-digits and treats the entire digit string as integer cents.
 * e.g. typing "12345" → "R$ 123,45"
 */
export function formatCurrencyInput(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  const cents = parseInt(digits, 10);
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

/**
 * Formats a numeric value from the database into "R$ X.XXX,00".
 * Accepts number or string like "1234.56".
 */
export function formatCurrencyFromDB(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(num)) return '';
  return num.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

/**
 * Parses "R$ 1.234,56" back to 1234.56 for API submission.
 */
export function parseCurrencyToNumber(formatted: string): number {
  const clean = formatted
    .replace(/R\$\s?/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  return parseFloat(clean) || 0;
}
