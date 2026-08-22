import type { AITool } from "mioku";
import type { SekaiStore } from "../data/store";
import { countRarities, pickActiveGacha, simulateGacha } from "../data/gacha";
import { cardImageUrl } from "../data/sources";
import { cardTitle, charFullName } from "../render/card";
import type { CompactCharacter } from "../types";

export function simulateGachaTool(store: SekaiStore, getMaxPulls: () => number): AITool {
  return {
    name: "simulate_gacha",
    description:
      "模拟《世界计划》抽卡：按当前卡池真实概率抽取，十连第 10 发含保底。返回抽取结果统计与高稀有度卡牌。",
    parameters: {
      type: "object",
      properties: {
        pulls: {
          type: "number",
          description: "抽卡次数，默认 10，单抽 1，上限由插件配置决定",
        },
      },
      required: [],
    },
    handler: async (args: { pulls?: number }) => {
      const raw = Number(args?.pulls);
      const pulls = Number.isFinite(raw) && raw > 0 ? Math.min(raw, getMaxPulls()) : 10;
      const gachas = await store.getGachas();
      const gacha = pickActiveGacha(gachas);
      if (!gacha) return "暂无卡池数据，无法模拟抽卡";
      const cards = await store.getCards();
      const cardById = new Map(cards.map((c) => [c.id, c]));
      const pulled = simulateGacha(gacha, cardById, cards, pulls);
      if (!pulled.length) return "抽卡失败：卡池为空";
      const chars = await store.getCharacters();
      const charMap = new Map(chars.map((c) => [c.id, c]));
      const counts = countRarities(pulled);
      const stars: Array<{ rarity: number; label: string }> = [
        { rarity: 4, label: "4★" },
        { rarity: 3, label: "3★" },
      ];
      const highlights = pulled
        .filter((p) => stars.some((s) => p.card.rarity === `rarity_${s.rarity}`))
        .map((p) => {
          const ch = charMap.get(p.card.characterId) as CompactCharacter | undefined;
          return `${cardTitle(p.card)}（${ch ? charFullName(ch) : ""}）${p.guarantee ? "[保底]" : ""}`;
        });
      const stat = Object.entries(counts)
        .map(([r, n]) => `${r.replace("rarity_", "")}★×${n}`)
        .join("，");
      const best = pulled
        .filter((p) => p.card.rarity === "rarity_4" || p.card.rarity === "rarity_birthday")
        .slice(0, 3);
      const lines = [
        `卡池：${gacha.name}`,
        `结果（共 ${pulls} 抽）：${stat}`,
      ];
      if (highlights.length) lines.push(`高稀有度：${highlights.join("、")}`);
      if (best.length) {
        lines.push(
          `最佳卡面：${best
            .map((p) => cardImageUrl(p.card.assetbundleName, p.card.hasTrained))
            .join(" | ")}`,
        );
      }
      return lines.join("\n");
    },
  } as AITool;
}
