export interface HasId {
  id?: number;
  seq?: number;
}

export function normalizeForSearch(s: string): string {
  return String(s ?? "")
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

export function findById<T extends HasId>(items: T[], raw: string): T | undefined {
  const q = raw.trim();
  if (!/^\d+$/.test(q)) return undefined;
  const n = Number(q);
  return items.find((i) => (i.id !== undefined && i.id === n) || i.seq === n);
}

interface ScoredItem<T> {
  item: T;
  category: number;
  confidence: number;
}

function uniqueChars(s: string): Set<string> {
  const out = new Set<string>();
  for (let i = 0; i < s.length; i++) out.add(s[i]);
  return out;
}

function tokenizeWords(s: string): string[] {
  return s.split(/[\s\-_/・,.。、:：]+/).filter(Boolean);
}

function subsequenceSpan(q: string, n: string): number {
  let qi = 0;
  let lastPos = -1;
  for (let ni = 0; ni < n.length && qi < q.length; ni++) {
    if (n[ni] === q[qi]) {
      qi++;
      lastPos = ni;
    }
  }
  return qi === q.length ? lastPos + 1 : -1;
}

function isWordBoundary(s: string, pos: number): boolean {
  if (pos <= 0) return true;
  const prev = s[pos - 1];
  return /[\s\-_/・,.。、:：()（）\[\]【】]/.test(prev);
}

function wordBoundaryBonus(q: string, n: string, matchStart: number): number {
  if (matchStart === 0) return 0.15;
  const prev = n[matchStart - 1];
  const cur = n[matchStart];
  if (prev && /\s/.test(prev)) return 0.1;
  if (prev && /[A-Z]/.test(cur) && /[a-z]/.test(prev)) return 0.08;
  if (prev && /[\-_/・,.。、:：]/.test(prev)) return 0.05;
  return 0;
}

interface ScoreResult {
  category: number;
  confidence: number;
}

function scoreField(q: string, n: string, qWords: string[], nWords: string[]): ScoreResult | null {
  if (n === q) return { category: 0, confidence: 1 };

  if (n.startsWith(q)) {
    return { category: 1, confidence: 0.9 + 0.1 * (q.length / n.length) };
  }

  const idx = n.indexOf(q);
  if (idx !== -1) {
    const base = 0.7 + 0.2 * (q.length / n.length);
    const bonus = wordBoundaryBonus(q, n, idx);
    return { category: 2, confidence: base + bonus };
  }

  const span = subsequenceSpan(q, n);
  if (span > 0) {
    const compactness = q.length / span;
    if (compactness < 0.5) return null;
    const start = n.indexOf(q[0]);
    if (start < 0 || !isWordBoundary(n, start)) return null;
    const bonus = wordBoundaryBonus(q, n, start);

    let wordScore = 0;
    if (qWords.length > 1) {
      let matched = 0;
      let prevEnd = -1;
      let ordered = true;
      for (const qw of qWords) {
        const qn = normalizeForSearch(qw);
        if (!qn) continue;
        let bestPos = -1;
        for (let i = 0; i < nWords.length; i++) {
          const wn = normalizeForSearch(nWords[i]);
          if (!wn) continue;
          if (wn.startsWith(qn) || qn.startsWith(wn) || wn.includes(qn) || qn.includes(wn)) {
            bestPos = i;
            break;
          }
        }
        if (bestPos >= 0) {
          matched++;
          if (bestPos <= prevEnd) ordered = false;
          prevEnd = bestPos;
        }
      }
      wordScore = (matched / qWords.length) * 0.25;
      if (ordered) wordScore += 0.05;
    }

    const confidence = compactness * 0.4 + bonus * 0.5 + wordScore * 0.5;
    return { category: 3, confidence: Math.min(0.85, confidence) };
  }

  if (q.length > 2) return null;

  let wordBag = 0;
  if (qWords.length > 1) {
    let matched = 0;
    for (const qw of qWords) {
      const qn = normalizeForSearch(qw);
      if (!qn) continue;
      if (nWords.some((w) => {
        const wn = normalizeForSearch(w);
        return wn && (wn.includes(qn) || qn.includes(wn));
      })) matched++;
    }
    wordBag = matched / qWords.length;
  }

  let charBag = 0;
  const qSet = uniqueChars(q);
  let charHits = 0;
  for (const ch of qSet) if (n.includes(ch)) charHits++;
  charBag = charHits / qSet.size;

  if (charBag < 0.6) return null;
  if (wordBag < 0.4 && qWords.length > 1) return null;

  const confidence = 0.15 * charBag + 0.25 * wordBag + 0.05 * (q.length / Math.max(n.length, 1));
  return { category: 4, confidence };
}

export function rankMatches<T>(
  items: T[],
  query: string,
  nameOf: (item: T) => string[],
  limit = 8,
): T[] {
  const q = normalizeForSearch(query);
  if (!q) return [];

  const qWords = tokenizeWords(query);

  const itemCount = items.length;
  const itemNames: string[][] = new Array(itemCount);
  const itemWordTokens: string[][] = new Array(itemCount);
  const charIndex = new Map<string, number[]>();

  for (let i = 0; i < itemCount; i++) {
    const names = nameOf(items[i]).map(normalizeForSearch).filter(Boolean);
    itemNames[i] = names;
    if (!names.length) continue;

    const seen = new Set<string>();
    for (const n of names) {
      for (let j = 0; j < n.length; j++) {
        const ch = n[j];
        if (seen.has(ch)) continue;
        seen.add(ch);
        let list = charIndex.get(ch);
        if (!list) {
          list = [];
          charIndex.set(ch, list);
        }
        list.push(i);
      }
    }
  }

  for (let i = 0; i < itemCount; i++) {
    itemWordTokens[i] = tokenizeWords(nameOf(items[i]).join(" "));
  }

  const qChars = [...uniqueChars(q)];
  if (!qChars.length) return [];

  const sets = qChars
    .map((ch) => charIndex.get(ch))
    .filter((s): s is number[] => Boolean(s))
    .sort((a, b) => a.length - b.length);
  if (sets.length !== qChars.length) return [];

  const smallest = sets[0];
  if (!smallest.length) return [];

  const hitCount = new Int32Array(itemCount);
  for (const i of smallest) hitCount[i] = 1;

  for (let s = 1; s < sets.length; s++) {
    const set = sets[s];
    if (!set.length) return [];
    for (const i of set) {
      const prev = hitCount[i];
      if (prev) hitCount[i] = prev + 1;
    }
  }

  const candidates: number[] = [];
  for (let i = 0; i < itemCount; i++) {
    if (hitCount[i] === qChars.length) candidates.push(i);
  }

  const scored: ScoredItem<T>[] = [];
  for (const i of candidates) {
    let bestCategory = 5;
    let bestConfidence = 0;
    for (const n of itemNames[i]) {
      const s = scoreField(q, n, qWords, itemWordTokens[i]);
      if (!s) continue;
      if (
        s.category < bestCategory ||
        (s.category === bestCategory && s.confidence > bestConfidence)
      ) {
        bestCategory = s.category;
        bestConfidence = s.confidence;
      }
    }
    if (bestCategory < 5) {
      scored.push({ item: items[i], category: bestCategory, confidence: bestConfidence });
    }
  }

  scored.sort((a, b) => {
    if (a.category !== b.category) return a.category - b.category;
    if (a.confidence !== b.confidence) return b.confidence - a.confidence;
    const ai = (a.item as { id?: number }).id;
    const bi = (b.item as { id?: number }).id;
    if (ai !== undefined && bi !== undefined) return bi - ai;
    return 0;
  });

  return scored.slice(0, limit).map((s) => s.item);
}