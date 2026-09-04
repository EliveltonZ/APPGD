interface Person {
  id: string;
  nome: string;
}

/** Busca por ID exato (string ou numérico — "07" e "7" são equivalentes). */
export function findPersonById<T extends Person>(
  list: T[],
  value: string,
): T | undefined {
  const v = value.trim();
  if (!v) return undefined;
  return list.find(
    (p) => p.id === v || (/^\d+$/.test(v) && Number(p.id) === Number(v)),
  );
}

/** Busca por ID (ver findPersonById) ou, se não achar, por nome exato (case-insensitive). */
export function findPersonByIdOrName<T extends Person>(
  list: T[],
  value: string,
): T | undefined {
  return (
    findPersonById(list, value) ??
    list.find((p) => p.nome.toLowerCase() === value.trim().toLowerCase())
  );
}
