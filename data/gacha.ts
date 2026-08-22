import type {
  CardRarity,
  CompactCard,
  CompactGacha,
  GachaPoolEntry,
  GachaRate,
  PulledCard,
} from "../types";

export function pickActiveGacha(
  gachas: CompactGacha[],
  now = Date.now(),
): CompactGacha | undefined {
  const active = gachas
    .filter(
      (g) => g.isShowPeriod !== false && g.startAt <= now && g.endAt >= now,
    )
    .sort((a, b) => b.id - a.id);
  if (active.length) return active[0];
  const ended = gachas.filter((g) => g.endAt < now).sort((a, b) => b.id - a.id);
  return ended[0];
}

export function rollRarity(
  rates: GachaRate[],
  kind: "normal" | "guarantee",
): CardRarity {
  const group = rates.filter((r) => r.lotteryType === kind);
  const pool = group.length ? group : rates;
  const total = pool.reduce((s, r) => s + r.rate, 0);
  if (total <= 0) return "rarity_2";
  let roll = Math.random() * total;
  for (const r of pool) {
    roll -= r.rate;
    if (roll <= 0) return r.rarity;
  }
  return pool[pool.length - 1].rarity;
}

export function pickCardFromPool(
  cardById: Map<number, CompactCard>,
  pool: GachaPoolEntry[],
  rarity: CardRarity,
  fallback: CompactCard[],
): CompactCard | undefined {
  const eligible = pool.filter(
    (e) => cardById.get(e.cardId)?.rarity === rarity,
  );
  if (eligible.length) {
    const total = eligible.reduce((s, e) => s + e.weight, 0);
    let roll = Math.random() * (total > 0 ? total : eligible.length);
    for (const e of eligible) {
      roll -= e.weight > 0 ? e.weight : 1;
      if (roll <= 0) return cardById.get(e.cardId);
    }
    return cardById.get(eligible[eligible.length - 1].cardId);
  }
  if (!fallback.length) return undefined;
  return fallback[Math.floor(Math.random() * fallback.length)];
}

export function simulateGacha(
  gacha: CompactGacha,
  cardById: Map<number, CompactCard>,
  allCards: CompactCard[],
  pulls: number,
): PulledCard[] {
  const hasGuarantee = gacha.rates.some((r) => r.lotteryType === "guarantee");
  const fallbackByRarity = new Map<CardRarity, CompactCard[]>();
  const result: PulledCard[] = [];
  for (let i = 0; i < pulls; i++) {
    const guarantee = hasGuarantee && (i + 1) % 10 === 0;
    const rarity = rollRarity(gacha.rates, guarantee ? "guarantee" : "normal");
    let fallback = fallbackByRarity.get(rarity);
    if (!fallback) {
      fallback = allCards.filter(
        (c) => c.rarity === rarity && c.releaseAt <= gacha.endAt,
      );
      fallbackByRarity.set(rarity, fallback);
    }
    const card = pickCardFromPool(cardById, gacha.cards, rarity, fallback);
    if (card) result.push({ card, guarantee });
  }
  return result;
}

export function countRarities(pulls: PulledCard[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of pulls) {
    counts[p.card.rarity] = (counts[p.card.rarity] ?? 0) + 1;
  }
  return counts;
}
