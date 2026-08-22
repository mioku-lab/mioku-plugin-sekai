export interface HasId {
  id: number;
  seq?: number;
}

export function normalizeText(s: string): string {
  return String(s ?? "").trim().toLowerCase().replace(/\s+/g, "");
}

export function rankMatches<T extends HasId>(
  items: T[],
  query: string,
  nameOf: (item: T) => string[],
  limit = 8,
): T[] {
  const terms = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (!terms.length) return [];
  const scored: Array<{ item: T; score: number }> = [];
  for (const item of items) {
    const names = nameOf(item).map(normalizeText).filter(Boolean);
    if (!names.length) continue;
    if (!terms.every((t) => names.some((n) => n.includes(t)))) continue;
    let score = 1000;
    for (const n of names) {
      const joined = terms.join("");
      if (n === joined) score = Math.min(score, 0);
      else if (n.startsWith(joined)) score = Math.min(score, 1);
      else if (n.includes(joined)) score = Math.min(score, 2 + n.length / 1000);
      else if (terms.every((t) => n.includes(t))) score = Math.min(score, 3);
    }
    scored.push({ item, score });
  }
  scored.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    return Number(b.item.id) - Number(a.item.id);
  });
  return scored.slice(0, limit).map((s) => s.item);
}

export function findById<T extends HasId>(items: T[], raw: string): T | undefined {
  const q = raw.trim();
  if (!/^\d+$/.test(q)) return undefined;
  const n = Number(q);
  return items.find((i) => i.id === n || i.seq === n);
}
