import { findPersonById, findPersonByIdOrName } from "../utils/people";

interface Person {
  id: string;
  nome: string;
}

/**
 * Valida um ID de operador/funcionário digitado contra a lista carregada.
 * Campo vazio é considerado válido aqui — use `required` (rules.ts) se o
 * preenchimento for obrigatório nesse formulário.
 */
export function validateOperadorId(value: string, people: Person[]): string | null {
  if (!value.trim()) return null;
  return findPersonById(people, value) ? null : "ID não encontrado";
}

/** Mesma validação, mas aceita também nome exato (case-insensitive). */
export function validateOperadorIdOuNome(value: string, people: Person[]): string | null {
  if (!value.trim()) return null;
  return findPersonByIdOrName(people, value) ? null : "Não encontrado";
}
