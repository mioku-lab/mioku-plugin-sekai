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
  const imagePath = await renderToImage(h.screenshot!, html);
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

export async function handleCharactersList(h: HandlerContext): Promise<string> {
  const [chars, units] = await Promise.all([
    h.store.getCharacters(),
    h.store.getUnits(),
  ]);
  await renderAndReply(h, renderCharacterList(chars, units));
  return `已为用户发送角色一览图（共 ${chars.length} 名角色）`;
}

export async function handleCharacter(h: HandlerContext, query: string): Promise<string> {
  const chars = await h.store.getCharacters();
  const found = findById(chars, query) ?? rankMatches(chars, query, CHARACTER_NAME_FIELDS)[0];
  if (!found) {
    await replyText(h.ctx, h.event, `没有找到角色「${query}」，试试 pj角色列表 看看全部角色`);
    return `未找到角色 ${query}`;
  }
  const [profiles, cards] = await Promise.all([h.store.getProfiles(), h.store.getCards()]);
  const profile = profiles.find((p) => p.characterId === found.id);
  const showcaseCard = cards
    .filter((card) => card.characterId === found.id)
    .sort((a, b) => Number(b.rarity === "rarity_4") - Number(a.rarity === "rarity_4") || b.id - a.id)[0];
  await renderAndReply(h, renderCharacterDetail(found, profile, showcaseCard));
  return `已为用户发送角色 ${charFullName(found)} 的详情图`;
}

export async function handleCard(h: HandlerContext, query: string): Promise<string> {
  if (!query) {
    await replyText(h.ctx, h.event, "用法：pj卡 <卡名/角色名/卡号>，例如 pj卡 心愿 / pj卡 88");
    return "用户调用 pj卡 但未提供查询关键字";
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
    return `未找到卡牌 ${query}`;
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
    return `卡牌 ${query} 有 ${matches.length} 个候选，已回复候选列表请用户细化`;
  }
  const card = matches[0];
  const character = charMap.get(card.characterId);
  const materials = await h.store.getMaterials();
  await renderAndReply(h, renderCardDetail(card, character, materials));
  const rarity = card.rarity.replace("rarity_", "");
  const ch = character ? charFullName(character) : `角色 #${card.characterId}`;
  return `已为用户发送 ${ch} 的卡牌 ${card.prefixZh ?? card.prefix}（#${card.id}，${rarity}★ ${card.attr}）卡面图`;
}

export async function handleMusic(h: HandlerContext, query: string): Promise<string> {
  if (!query) {
    await replyText(h.ctx, h.event, "用法：pj曲 <曲名>，例如 pj曲 ロキ / pj曲 Tell Your World");
    return "用户调用 pj曲 但未提供查询关键字";
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
    return `未找到乐曲 ${query}`;
  }
  if (matches.length > 1) {
    const list = matches
      .slice(0, 8)
      .map((m) => `#${m.id} ${m.titleZh ?? m.title}${m.artist ? `（${m.artist}）` : ""}`)
      .join("\n");
    await replyText(h.ctx, h.event, `找到 ${matches.length} 首相关乐曲：\n${list}`);
    return `乐曲 ${query} 有 ${matches.length} 个候选，已回复候选列表请用户细化`;
  }
  const m = matches[0];
  await renderAndReply(h, renderMusicDetail(m));
  return `已为用户发送乐曲 ${m.titleZh ?? m.title}（#${m.id}）的详情图`;
}

export async function handleEvent(h: HandlerContext, id?: number): Promise<string> {
  const events = await h.store.getEvents();
  if (id != null && id > 0) {
    const ev = events.find((e) => e.id === id);
    if (!ev) {
      await replyText(h.ctx, h.event, `没有找到编号为 ${id} 的活动，试试 pj活动列表 查看近期活动`);
      return `未找到活动 ${id}`;
    }
    await renderAndReply(h, renderEventDetail(ev));
    return `已为用户发送活动 ${ev.nameZh ?? ev.name}（#${ev.id}）详情图`;
  }
  const sorted = [...events].sort((a, b) => b.id - a.id);
  const now = Date.now();
  const current =
    sorted.find((e) => e.startAt <= now && e.distributionEndAt >= now) ?? sorted[0];
  if (!current) {
    await replyText(h.ctx, h.event, "暂无活动数据");
    return "暂无活动数据";
  }
  await renderAndReply(h, renderEventDetail(current, now));
  return `已为用户发送活动 ${current.nameZh ?? current.name}（#${current.id}）详情图`;
}

export async function handleEventList(h: HandlerContext, count = 8): Promise<string> {
  const events = await h.store.getEvents();
  const sorted = [...events].sort((a, b) => b.id - a.id);
  const picked = sorted.slice(0, Math.min(Math.max(count, 1), 12));
  await renderAndReply(h, renderEventList(picked));
  return `已为用户发送最近 ${picked.length} 期活动列表图`;
}

export async function handleGachaInfo(h: HandlerContext): Promise<string> {
  const gachas = await h.store.getGachas();
  const gacha = pickActiveGacha(gachas);
  if (!gacha) {
    await replyText(h.ctx, h.event, "暂无卡池数据");
    return "暂无卡池数据";
  }
  const [cards, chars] = await Promise.all([
    h.store.getCards(),
    h.store.getCharacters(),
  ]);
  const cardById = new Map(cards.map((c) => [c.id, c]));
  const charMap = new Map(chars.map((c) => [c.id, c]));
  await renderAndReply(h, renderGachaInfo(gacha, cardById, charMap, h.getConfig().showTrained));
  return `已为用户发送当前卡池 ${gacha.name}（#${gacha.id}）的详情图`;
}
