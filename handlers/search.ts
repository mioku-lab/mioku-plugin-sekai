import type {
  ArtistInfo,
  CompactCard,
  CompactCharacter,
  CompactEvent,
  CompactGacha,
  CompactMusic,
} from "../types";
import type { SekaiStore } from "../data/store";
import { rankMatches } from "../data/search";
import { replyText } from "../utils";
import type { HandlerContext } from "./types";

function charName(c: CompactCharacter): string {
  return c.nameZh ?? `${c.firstName}${c.givenName}`;
}

export interface SearchResult {
  text: string;
  total: number;
  counts: {
    artists: number;
    characters: number;
    cards: number;
    musics: number;
    events: number;
    gachas: number;
  };
}

export async function searchSekaiData(
  store: SekaiStore,
  query: string,
): Promise<SearchResult | null> {
  const q = query.trim();
  if (!q) return null;

  const [chars, cards, musics, events, gachas, artists] = await Promise.all([
    store.getCharacters(),
    store.getCards(),
    store.getMusics(),
    store.getEvents(),
    store.getGachas(),
    store.getArtists(),
  ]);
  const charMap = new Map(chars.map((c) => [c.id, c]));

  const charMatches = rankMatches(chars, q, (c) => [
    c.nameZh ?? "",
    `${c.firstName}${c.givenName}`,
    c.firstName,
    c.givenName,
    `${c.firstNameEn} ${c.givenNameEn}`.trim(),
    c.firstNameEn,
    c.givenNameEn,
  ]);

  const cardMatches = rankMatches(cards, q, (c) => {
    const ch = charMap.get(c.characterId);
    return [
      c.prefixZh ?? "",
      c.prefix,
      c.cardSkillName,
      ...(ch
        ? [ch.nameZh ?? "", `${ch.firstName}${ch.givenName}`, ch.firstNameEn]
        : []),
    ];
  });

  const musicMatches = rankMatches(musics, q, (m: CompactMusic) => [
    m.titleZh ?? "",
    m.title,
    m.artist ?? "",
  ]);

  const artistMatches = rankMatches(
    artists,
    q,
    (a: ArtistInfo) => [a.name],
    10,
  );

  const eventMatches = rankMatches(events, q, (e: CompactEvent) => [
    e.nameZh ?? "",
    e.name,
  ]);

  const gachaMatches = rankMatches(gachas, q, (g: CompactGacha) => [g.name]);

  const counts = {
    artists: artistMatches.length,
    characters: charMatches.length,
    cards: cardMatches.length,
    musics: musicMatches.length,
    events: eventMatches.length,
    gachas: gachaMatches.length,
  };
  const total =
    counts.artists +
    counts.characters +
    counts.cards +
    counts.musics +
    counts.events +
    counts.gachas;
  if (!total) return null;

  const sections: string[] = [];

  if (artistMatches.length) {
    const list = artistMatches
      .slice(0, 8)
      .map((a) => `- ${a.name}（${a.musicCount} 首）`)
      .join("\n");
    sections.push(`【艺人】(${counts.artists})\n${list}`);
  }

  if (charMatches.length) {
    const list = charMatches
      .slice(0, 8)
      .map((c) => `- ${charName(c)} #${c.id}`)
      .join("\n");
    sections.push(`【角色】(${counts.characters})\n${list}`);
  }

  if (cardMatches.length) {
    const list = cardMatches
      .slice(0, 8)
      .map((c: CompactCard) => {
        const ch = charMap.get(c.characterId);
        const chName = ch ? charName(ch) : "";
        return `- #${c.id} ${c.prefixZh ?? c.prefix}${
          chName ? `（${chName} · ${c.rarity.replace("rarity_", "")}★）` : ""
        }`;
      })
      .join("\n");
    sections.push(`【卡牌】(${counts.cards})\n${list}`);
  }

  if (musicMatches.length) {
    const list = musicMatches
      .slice(0, 8)
      .map(
        (m) =>
          `- #${m.id} ${m.titleZh ?? m.title}${m.artist ? `（${m.artist}）` : ""}`,
      )
      .join("\n");
    sections.push(`【乐曲】(${counts.musics})\n${list}`);
  }

  if (eventMatches.length) {
    const list = eventMatches
      .slice(0, 8)
      .map((e) => `- #${e.id} ${e.nameZh ?? e.name}`)
      .join("\n");
    sections.push(`【活动】(${counts.events})\n${list}`);
  }

  if (gachaMatches.length) {
    const list = gachaMatches
      .slice(0, 8)
      .map((g) => `- #${g.id} ${g.name}`)
      .join("\n");
    sections.push(`【卡池】(${counts.gachas})\n${list}`);
  }

  return {
    text: `${sections.join("\n\n")}\n\n共 ${total} 条结果`,
    total,
    counts,
  };
}

export async function handleSearch(
  h: HandlerContext,
  query: string,
): Promise<string> {
  const q = query.trim();
  if (!q) {
    await replyText(
      h.ctx,
      h.event,
      "用法：pj搜索 <关键字>，例如 pj搜索 心愿 / pj搜索 miku",
    );
    return "用户调用 pj搜索 但未提供关键字";
  }

  const result = await searchSekaiData(h.store, q);
  if (!result) {
    await replyText(h.ctx, h.event, `没有找到与「${q}」相关的内容`);
    return `pj搜索 ${q} 无结果`;
  }

  await replyText(h.ctx, h.event, result.text);
  const c = result.counts;
  return `pj搜索 ${q} 找到 ${result.total} 条结果（艺人 ${c.artists}、角色 ${c.characters}、卡 ${c.cards}、曲 ${c.musics}、活动 ${c.events}、卡池 ${c.gachas}）`;
}