import { countRarities, pickActiveGacha, simulateGacha } from "../data/gacha";
import { renderGachaResult } from "../render/gacha";
import { renderToImage } from "../render";
import { replyImage, replyText } from "../utils";
import type { HandlerContext } from "./types";

export async function handleRoll(h: HandlerContext, requested: number): Promise<string> {
  const config = h.getConfig();
  const pulls =
    requested > 0 ? Math.min(requested, config.maxPulls) : config.defaultPulls;

  const gachas = await h.store.getGachas();
  const gacha = pickActiveGacha(gachas);
  if (!gacha) {
    await replyText(h.ctx, h.event, "暂无卡池数据，无法模拟抽卡");
    return "暂无卡池数据，无法模拟抽卡";
  }

  const [cards, chars] = await Promise.all([
    h.store.getCards(),
    h.store.getCharacters(),
  ]);
  const cardById = new Map(cards.map((c) => [c.id, c]));
  const charMap = new Map(chars.map((c) => [c.id, c]));

  const pulled = simulateGacha(gacha, cardById, cards, pulls);
  if (!pulled.length) {
    await replyText(h.ctx, h.event, "抽卡失败：卡池为空");
    return "卡池为空，抽卡失败";
  }
  const counts = countRarities(pulled);
  const stat = Object.entries(counts)
    .map(([r, n]) => `${r.replace("rarity_", "")}★×${n}`)
    .join("　");

  if (h.screenshot) {
    const html = renderGachaResult(
      { gacha, pulls: pulled, counts },
      charMap,
      config.showTrained,
    );
    const imagePath = await renderToImage(h.screenshot, html, config.imageWidth);
    await replyImage(h.ctx, h.event, imagePath, `【${gacha.name}】${stat}　共${pulls}抽`);
    return `已为用户发送 ${gacha.name} 的 ${pulls} 抽结果图（${stat}）`;
  }

  const top = pulled
    .filter((p) => p.card.rarity === "rarity_4" || p.card.rarity === "rarity_birthday")
    .slice(0, 5);
  const lines = [`【${gacha.name}】${stat}　共${pulls}抽`];
  if (top.length) {
    lines.push(
      `出货：${top
        .map((p) => {
          const ch = charMap.get(p.card.characterId);
          return `${p.card.prefixZh ?? p.card.prefix}${ch ? `（${ch.nameZh ?? ""}）` : ""}`;
        })
        .join("、")}`,
    );
  }
  await replyText(h.ctx, h.event, lines.join("\n"));
  return `已为用户发送 ${gacha.name} 的 ${pulls} 抽结果文字（${stat}）`;
}