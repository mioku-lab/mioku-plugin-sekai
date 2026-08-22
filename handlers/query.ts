import type { CompactCharacter, CompactMusic } from "../types";
import { findById, rankMatches } from "../data/search";
import { pickActiveGacha } from "../data/gacha";
import { renderToImage } from "../render";
import { cardSearchFields, charFullName, renderCardDetail } from "../render/card";
import { renderCharacterDetail, renderCharacterList } from "../render/character";
import { renderEventDetail, renderEventList } from "../render/event";
import { renderGachaInfo } from "../render/gacha";
import { renderMusicDetail } from "../render/music";
import { replyImage, replyText } from "../utils";
import type { HandlerContext } from "./types";

function requireScreenshot(h: HandlerContext): boolean {
  if (h.screenshot) return true;
  void replyText(h.ctx, h.event, "缺少 screenshot 服务，无法渲染图片，请安装 mioku-service-screenshot");
  return false;
}

async function renderAndReply(h: HandlerContext, html: string): Promise<void> {
  if (!requireScreenshot(h)) return;
  const imagePath = await renderToImage(h.screenshot!, html, h.getConfig().imageWidth);
  await replyImage(h.ctx, h.event, imagePath);
}

const CHARACTER_NAME_FIELDS = (c: CompactCharacter) => [
  c.nameZh ?? "",
  `${c.firstName ?? ""}${c.givenName ?? ""}`,
  c.firstName ?? "",
  c.givenName ?? "",
  `${c.firstNameEn ?? ""} ${c.givenNameEn ?? ""}`.trim(),
  c.firstNameEn ?? "",
  c.givenNameEn ?? "",
];

export async function handleCharactersList(h: HandlerContext): Promise<void> {
  const [chars, units] = await Promise.all([
    h.store.getCharacters(),
    h.store.getUnits(),
  ]);
  await renderAndReply(h, renderCharacterList(chars, units));
}

export async function handleCharacter(h: HandlerContext, query: string): Promise<void> {
  const chars = await h.store.getCharacters();
  const found = findById(chars, query) ?? rankMatches(chars, query, CHARACTER_NAME_FIELDS)[0];
  if (!found) {
    await replyText(h.ctx, h.event, `没有找到角色「${query}」，试试 pj角色列表 看看全部角色`);
    return;
  }
  const profiles = await h.store.getProfiles();
  const profile = profiles.find((p) => p.characterId === found.id);
  await renderAndReply(h, renderCharacterDetail(found, profile));
}

export async function handleCard(h: HandlerContext, query: string): Promise<void> {
  if (!query) {
    await replyText(h.ctx, h.event, "用法：pj卡 <卡名/角色名/卡号>，例如 pj卡 心愿 / pj卡 88");
    return;
  }
  const cards = await h.store.getCards();
  const chars = await h.store.getCharacters();
  const charMap = new Map(chars.map((c) => [c.id, c]));

  const byId = findById(cards, query);
  const matches = byId
    ? [byId]
    : rankMatches(cards, query, (c) => cardSearchFields(c, charMap.get(c.characterId)));
  if (!matches.length) {
    await replyText(h.ctx, h.event, `没有找到卡牌「${query}」，换个关键词试试`);
    return;
  }
  if (matches.length > 1) {
    const list = matches
      .slice(0, 8)
      .map(
        (c) =>
          `#${c.id} ${c.prefixZh ?? c.prefix}（${charMap.get(c.characterId) ? charFullName(charMap.get(c.characterId)!) : ""} · ${c.rarity.replace("rarity_", "")}★）`,
      )
      .join("\n");
    await replyText(h.ctx, h.event, `找到 ${matches.length} 张相关卡牌，请提供更精确的名称或卡号：\n${list}`);
    return;
  }
  const card = matches[0];
  const character = charMap.get(card.characterId);
  await renderAndReply(h, renderCardDetail(card, character));
}

export async function handleMusic(h: HandlerContext, query: string): Promise<void> {
  if (!query) {
    await replyText(h.ctx, h.event, "用法：pj曲 <曲名>，例如 pj曲 ロキ / pj曲 Tell Your World");
    return;
  }
  const musics = await h.store.getMusics();
  const byId = findById(musics, query);
  const matches = byId
    ? [byId]
    : rankMatches(musics, query, (m: CompactMusic) => [
        m.titleZh ?? "",
        m.title,
        m.artist ?? "",
      ]);
  if (!matches.length) {
    await replyText(h.ctx, h.event, `没有找到乐曲「${query}」`);
    return;
  }
  if (matches.length > 1) {
    const list = matches
      .slice(0, 8)
      .map((m) => `#${m.id} ${m.titleZh ?? m.title}${m.artist ? `（${m.artist}）` : ""}`)
      .join("\n");
    await replyText(h.ctx, h.event, `找到 ${matches.length} 首相关乐曲：\n${list}`);
    return;
  }
  await renderAndReply(h, renderMusicDetail(matches[0]));
}

export async function handleEvent(h: HandlerContext, count?: number): Promise<void> {
  const events = await h.store.getEvents();
  const sorted = [...events].sort((a, b) => b.id - a.id);
  const now = Date.now();

  if (count && count > 0) {
    await renderAndReply(h, renderEventList(sorted.slice(0, Math.min(count, 8))));
    return;
  }
  const current =
    sorted.find((e) => e.startAt <= now && e.distributionEndAt >= now) ?? sorted[0];
  if (!current) {
    await replyText(h.ctx, h.event, "暂无活动数据");
    return;
  }
  await renderAndReply(h, renderEventDetail(current, now));
}

export async function handleGachaInfo(h: HandlerContext): Promise<void> {
  const gachas = await h.store.getGachas();
  const gacha = pickActiveGacha(gachas);
  if (!gacha) {
    await replyText(h.ctx, h.event, "暂无卡池数据");
    return;
  }
  const [cards, chars] = await Promise.all([
    h.store.getCards(),
    h.store.getCharacters(),
  ]);
  const cardById = new Map(cards.map((c) => [c.id, c]));
  const charMap = new Map(chars.map((c) => [c.id, c]));
  await renderAndReply(h, renderGachaInfo(gacha, cardById, charMap, h.getConfig().showTrained));
}
