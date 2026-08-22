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

export function characterInfoTool(store: SekaiStore): AITool {
  return {
    name: "character_info",
    description:
      "查询《世界计划》角色信息，如生日、身高、CV、所属组合等。支持中文名、日文名、英文名或角色 id。",
    parameters: {
      type: "object",
      properties: { name: { type: "string", description: "角色名称或 id" } },
      required: ["name"],
    },
    handler: async (args: { name?: string }) => {
      const query = String(args?.name ?? "").trim();
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
    },
  } as AITool;
}

export function cardInfoTool(store: SekaiStore): AITool {
  return {
    name: "card_info",
    description:
      "查询《世界计划》卡牌信息，如稀有度、属性、技能、综合力、实装时间。支持中文卡名、日文卡名、角色名或卡牌 id（卡牌 id 与角色 id 不同，用 卡号 搜索时请带上数字）。",
    parameters: {
      type: "object",
      properties: { query: { type: "string", description: "卡牌名称、角色名或卡牌 id" } },
      required: ["query"],
    },
    handler: async (args: { query?: string }) => {
      const query = String(args?.query ?? "").trim();
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
    },
  } as AITool;
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

export function musicInfoTool(store: SekaiStore): AITool {
  return {
    name: "music_info",
    description:
      "查询《世界计划》乐曲信息，如作曲、作词、演唱者、各难度等级与 Note 数。支持中文曲名、日文曲名、英文曲名或乐曲 id。",
    parameters: {
      type: "object",
      properties: { query: { type: "string", description: "乐曲名称或 id" } },
      required: ["query"],
    },
    handler: async (args: { query?: string }) => {
      const query = String(args?.query ?? "").trim();
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
          (d) =>
            `  ${d.difficulty} LV${d.playLevel}（${d.totalNoteCount} notes）`,
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
    },
  } as AITool;
}

export function eventInfoTool(store: SekaiStore): AITool {
  return {
    name: "event_info",
    description:
      "查询《世界计划》活动信息：当前进行中的活动（默认），或最近结束的活动（scope=latest），或最近 N 期活动列表（scope=recent）。",
    parameters: {
      type: "object",
      properties: {
        scope: {
          type: "string",
          enum: ["current", "latest", "recent"],
          description: "current=当前进行中，latest=最近一期，recent=最近 5 期列表",
        },
      },
      required: [],
    },
    handler: async (args: { scope?: string }) => {
      const events = await store.getEvents();
      const now = Date.now();
      const sorted = [...events].sort((a, b) => b.id - a.id);
      const scope = args?.scope ?? "current";
      if (scope === "recent") {
        return sorted
          .slice(0, 5)
          .map(eventLine)
          .join("\n");
      }
      if (scope === "latest") {
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
    },
  } as AITool;
}

export function gachaInfoTool(store: SekaiStore): AITool {
  return {
    name: "gacha_info",
    description:
      "查询《世界计划》当前进行中的卡池信息，包括概率与卡池范围；无进行中卡池时返回最近结束的卡池。",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    handler: async () => {
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
    },
  } as AITool;
}
