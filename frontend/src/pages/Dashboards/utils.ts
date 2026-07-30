export function countBy<T>(records: T[], key: keyof T): Map<string, number> {
  const counts = new Map<string, number>();
  for (const r of records)
    counts.set(String(r[key]), (counts.get(String(r[key])) ?? 0) + 1);
  return counts;
}

export function topKey<T>(records: T[], key: keyof T): string {
  const counts = countBy(records, key);
  let best = "—",
    bestN = 0;
  for (const [k, v] of counts)
    if (v > bestN) {
      best = k;
      bestN = v;
    }
  return best;
}