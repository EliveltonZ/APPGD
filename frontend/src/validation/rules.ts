/** Retorna mensagem de erro ou null se válido */

export function required(value: unknown, label: string): string | null {
  if (value === null || value === undefined) return `${label} é obrigatório`;
  if (typeof value === "string" && !value.trim()) return `${label} é obrigatório`;
  if (typeof value === "number" && isNaN(value)) return `${label} é obrigatório`;
  return null;
}

export function minLength(value: string, min: number, label: string): string | null {
  if (value.trim().length < min)
    return `${label} deve ter no mínimo ${min} caractere${min > 1 ? "s" : ""}`;
  return null;
}

export function isNumeric(value: string, label: string): string | null {
  if (!/^\d+$/.test(value.trim())) return `${label} deve conter apenas números`;
  return null;
}

export function isPositive(value: number | string, label: string): string | null {
  const n = typeof value === "string" ? Number(value) : value;
  if (isNaN(n) || n <= 0) return `${label} deve ser maior que zero`;
  return null;
}

export function mustMatch(value: string, reference: string, label: string): string | null {
  if (value !== reference) return `${label} não confere`;
  return null;
}

export function mustDiffer(value: string, reference: string, label: string): string | null {
  if (value === reference) return `${label} deve ser diferente da senha atual`;
  return null;
}

export function dateNotBefore(
  dateA: string,
  dateB: string,
  labelA: string,
  labelB: string,
): string | null {
  if (!dateA || !dateB) return null;
  if (new Date(dateA) < new Date(dateB))
    return `${labelA} não pode ser anterior a ${labelB}`;
  return null;
}
