import type { AITool } from "mioku";
import type { SekaiStore } from "../data/store";
import { findById, rankMatches } from "../data/search";
import { pickActiveGacha } from "../data/gacha";
import { cardImageUrl } from "../data/sources";
import { cardSearchFields, cardTitle, charFullName } from "../render/card";
import type {
  CompactCard,
  CompactCharacter,
  CompactEvent,
  CompactGacha,
  CompactMusic,
} from "../types";

function charName(c: CompactCharacter): string {
  return charFullName(c);
}

function cardLine(c: CompactCard, chars: Map<number, CompactCharacter>): string {
  const ch = chars.get(c.characterId);
  return `#${c.id} ${cardTitle(c)}（${ch ? charName(ch) : "角色" + c.characterId}，${c.rarity.replace("rarity_", "")}★，${c.attr}属性）`;
}

function musicLine(m: CompactMusic): string {
  const hardest = m.difficulties.length
    ? [...m.difficulties].sort((a, b) => b.playLevel - a.playLevel)[0]
    : undefined;
  return `#${m.id} ${m.titleZh ?? m.title}${m.artist ? `（${m.artist}）` : ""}${
    hardest ? `，最高难度 LV${hardest.playLevel}（${hardest.difficulty}）` : ""
  }`;
}

function eventStatus(e: CompactEvent, now = Date.now()): string {
  if (now < e.startAt) return "未开始";
  if (now <= e.distributionEndAt) return "进行中";
  return "已结束";
}

function eventLine(e: CompactEvent): string {
  return `#${e.id} ${e.nameZh ?? e.name}（${e.eventType}，${eventStatus(e)}，${new Date(e.startAt).toLocaleString()} 开始）`;
}

function gachaLine(g: CompactGacha): string {
  const normal = g.rates
    .filter((r) => r.lotteryType === "normal")
    .map((r) => `${r.rarity.replace("rarity_", "")}★ ${r.rate}%`)
    .join(", ");
  return `#${g.id} ${g.name}（${normal}）`;
}

async function formatCardDetail(
  card: CompactCard,
  charMap: Map<number, CompactCharacter>,
): Promise<string> {
  const ch = charMap.get(card.characterId);
  return [
    `#${card.id} ${cardTitle(card)}（${ch ? charName(ch) : "角色" + card.characterId}）`,
    `稀有度：${card.rarity.replace("rarity_", "")}★　属性：${card.attr}　技能：${card.cardSkillName}`,
    `综合力：${card.maxPower ?? "-"}${card.trainedPower ? `（特训后 ${card.trainedPower}）` : ""}`,
    `实装：${new Date(card.releaseAt).toLocaleDateString()}`,
    `卡面：${cardImageUrl(card.assetbundleName, false)}`,
    card.hasTrained ? `特训后卡面：${cardImageUrl(card.assetbundleName, true)}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

async function handleCharacterInfo(store: SekaiStore, raw: string): Promise<string> {
  const query = raw.trim();
  if (!query) return "请提供角色名称或 id";
  const chars = await store.getCharacters();
  const found = findById(chars, query) ?? rankMatches(chars, query, (c) => [
    c.nameZh ?? "",
    `${c.firstName ?? ""}${c.givenName ?? ""}`,
    c.firstName ?? "",
    c.givenName ?? "",
    `${c.firstNameEn ?? ""} ${c.givenNameEn ?? ""}`.trim(),
    c.firstNameEn ?? "",
    c.givenNameEn ?? "",
  ])[0];
  if (!found) return `未找到角色「${query}」`;
  const profiles = await store.getProfiles();
  const profile = profiles.find((p) => p.characterId === found.id);
  const lines = [
    `${charName(found)}（${found.firstName} ${found.givenName} / ${found.firstNameEn} ${found.givenNameEn}）`,
    `组合：${found.unitName ?? found.unit}`,
    `id：${found.id}`,
  ];
  if (profile) {
    lines.push(
      `CV：${profile.voice}`,
      `生日：${profile.birthday}`,
      `身高：${profile.height}`,
      `学校：${profile.school} ${profile.schoolYear}`,
      `兴趣：${profile.hobby.replace(/\n/g, "、")}`,
      `特长：${profile.specialSkill}`,
      `喜欢的食物：${profile.favoriteFood}`,
      `讨厌的食物：${profile.hatedFood}`,
      `弱点：${profile.weak}`,
      `简介：${profile.introduction}`,
    );
  }
  return lines.join("\n");
}

async function handleCardInfo(store: SekaiStore, raw: string): Promise<string> {
  const query = raw.trim();
  if (!query) return "请提供卡牌名称或 id";
  const cards = await store.getCards();
  const chars = await store.getCharacters();
  const charMap = new Map(chars.map((c) => [c.id, c]));
  const byId = findById(cards, query);
  if (byId) {
    return formatCardDetail(byId, charMap);
  }
  const matches = rankMatches(cards, query, (c) =>
    cardSearchFields(c, charMap.get(c.characterId)),
  );
  if (!matches.length) return `未找到卡牌「${query}」`;
  if (matches.length > 1) {
    return `找到 ${matches.length} 张相关卡牌，请提供更精确的名称或卡牌 id：\n${matches
      .slice(0, 8)
      .map((c) => cardLine(c, charMap))
      .join("\n")}`;
  }
  return formatCardDetail(matches[0], charMap);
}

async function handleMusicInfo(store: SekaiStore, raw: string): Promise<string> {
  const query = raw.trim();
  if (!query) return "请提供乐曲名称或 id";
  const musics = await store.getMusics();
  const byId = findById(musics, query);
  const matches = byId
    ? [byId]
    : rankMatches(musics, query, (m) => [m.titleZh ?? "", m.title, m.artist ?? ""]);
  if (!matches.length) return `未找到乐曲「${query}」`;
  if (matches.length > 1) {
    return `找到 ${matches.length} 首相关乐曲：\n${matches
      .slice(0, 8)
      .map(musicLine)
      .join("\n")}`;
  }
  const m = matches[0];
  const diffs = m.difficulties
    .map(
      (d) => `  ${d.difficulty} LV${d.playLevel}（${d.totalNoteCount} notes）`,
    )
    .join("\n");
  return [
    `#${m.id} ${m.titleZh ?? m.title}${m.titleZh && m.titleZh !== m.title ? `（${m.title}）` : ""}`,
    `作者：${m.artist ?? "-"}　作词：${m.lyricist || "-"}　作曲：${m.composer || "-"}　编曲：${m.arranger || "-"}`,
    m.vocals?.length ? `演唱：${m.vocals.join("、")}` : "",
    diffs ? `谱面：\n${diffs}` : "暂无谱面数据",
  ]
    .filter(Boolean)
    .join("\n");
}

async function handleEventInfo(
  store: SekaiStore,
  scope: string | undefined,
): Promise<string> {
  const events = await store.getEvents();
  const now = Date.now();
  const sorted = [...events].sort((a, b) => b.id - a.id);
  const which = scope ?? "current";
  if (which === "recent") {
    return sorted
      .slice(0, 5)
      .map(eventLine)
      .join("\n");
  }
  if (which === "latest") {
    const latest = sorted.find((e) => e.distributionEndAt < now) ?? sorted[0];
    return latest ? eventLine(latest) : "暂无活动数据";
  }
  const current =
    sorted.find((e) => e.startAt <= now && e.distributionEndAt >= now) ??
    sorted[0];
  if (!current) return "暂无活动数据";
  const e = current;
  return [
    eventLine(e),
    `开始：${new Date(e.startAt).toLocaleString()}`,
    `结算：${new Date(e.aggregateAt).toLocaleString()}`,
    `排行公布：${new Date(e.rankingAnnounceAt).toLocaleString()}`,
    `奖励分发截止：${new Date(e.distributionEndAt).toLocaleString()}`,
  ].join("\n");
}

async function handleGachaInfo(store: SekaiStore): Promise<string> {
  const gachas = await store.getGachas();
  const gacha = pickActiveGacha(gachas);
  if (!gacha) return "暂无卡池数据";
  const cards = await store.getCards();
  const cardById = new Map(cards.map((c) => [c.id, c]));
  const chars = await store.getCharacters();
  const charMap = new Map(chars.map((c) => [c.id, c]));
  const up = [...gacha.cards]
    .sort((a, b) => Number(b.isWish) - Number(a.isWish))
    .slice(0, 6)
    .map((e) => cardById.get(e.cardId))
    .filter(Boolean)
    .map((c) => cardLine(c as CompactCard, charMap));
  return [
    gachaLine(gacha),
    `时间：${new Date(gacha.startAt).toLocaleString()} ~ ${new Date(gacha.endAt).toLocaleString()}`,
    up.length ? `UP 卡池：\n${up.join("\n")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function infoTool(store: SekaiStore): AITool {
  return {
    name: "info",
    description:
      "查询《世界计划》（PJSK）游戏数据。按 type 选择查询类型：\n- character：角色详情（生日/身高/CV/组合/简介），按 query（中/日/英文名或角色 id）\n- card：卡牌详情（稀有度/属性/技能/综合力/实装时间/卡面），按 query（卡名/角色名/卡号）\n- music：乐曲详情（作者/作词/编曲/演唱者/全难度等级与 Note 数），按 query（曲名或乐曲 id）\n- event：活动，scope=current（当前进行中，默认）/latest（最近一期）/recent（最近 5 期列表）\n- gacha：当前卡池信息（概率/UP 卡池），无需其他参数",
    parameters: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["character", "card", "music", "event", "gacha"],
          description: "查询类型",
        },
        query: {
          type: "string",
          description: "查询关键字，type=character / card / music 时使用",
        },
        scope: {
          type: "string",
          enum: ["current", "latest", "recent"],
          description: "活动查询范围，仅 type=event 时使用，默认 current",
        },
      },
      required: ["type"],
    },
    handler: async (args: {
      type?: string;
      query?: string;
      scope?: string;
    }) => {
      const type = args?.type;
      if (!type) {
        return "缺少 type 参数，可选：character / card / music / event / gacha";
      }
      switch (type) {
        case "character":
          return handleCharacterInfo(store, String(args.query ?? ""));
        case "card":
          return handleCardInfo(store, String(args.query ?? ""));
        case "music":
          return handleMusicInfo(store, String(args.query ?? ""));
        case "event":
          return handleEventInfo(store, args.scope);
        case "gacha":
          return handleGachaInfo(store);
        default:
          return `未知查询类型 ${type}，可选：character / card / music / event / gacha`;
      }
    },
  } as AITool;
}