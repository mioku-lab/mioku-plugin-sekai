import type {
  CompactCard,
  CompactCharacter,
  CompactGacha,
  GachaResult,
} from "../types";
import { cardImageUrl } from "../data/sources";
import {
  RARITY_COLOR,
  RARITY_NAME,
  badge,
  esc,
  head,
  htmlShell,
  kv,
  panel,
  timeRange,
} from "./theme";
import { cardTitle, charFullName } from "./card";

function cardCell(
  card: CompactCard,
  characters: Map<number, CompactCharacter>,
  trained: boolean,
  extra?: string,
): string {
  const rarityColor = RARITY_COLOR[card.rarity];
  const art = trained && card.hasTrained
    ? cardImageUrl(card.assetbundleName, true)
    : cardImageUrl(card.assetbundleName, false);
  const char = characters.get(card.characterId);
  return `<div class="cell" style="border-color:${rarityColor}">
    <img src="${art}"/>
    <div class="cap">
      <div class="n" style="color:${rarityColor}">${RARITY_NAME[card.rarity]}${extra ? ` · ${esc(extra)}` : ""}</div>
      <div class="s" style="color:${rarityColor}aa">${esc(cardTitle(card))}</div>
      <div class="s">${char ? esc(charFullName(char)) : ""}</div>
    </div>
  </div>`;
}

export function renderGachaInfo(
  gacha: CompactGacha,
  cardById: Map<number, CompactCard>,
  characters: Map<number, CompactCharacter>,
  showTrained: boolean,
): string {
  const normal = gacha.rates.filter((r) => r.lotteryType === "normal");
  const guarantee = gacha.rates.filter((r) => r.lotteryType === "guarantee");
  const rateRow = (list: typeof normal) =>
    list
      .map(
        (r) =>
          `${RARITY_NAME[r.rarity]} <span style="color:${RARITY_COLOR[r.rarity]}">${r.rate}%</span>`,
      )
      .join("　");

  const seen = new Set<number>();
  const up: CompactCard[] = [];
  for (const entry of [...gacha.cards].sort((a, b) => Number(b.isWish) - Number(a.isWish))) {
    if (up.length >= 8) break;
    if (seen.has(entry.cardId)) continue;
    const card = cardById.get(entry.cardId);
    if (!card) continue;
    if (!entry.isWish && card.rarity !== "rarity_4" && card.rarity !== "rarity_birthday" && card.rarity !== "rarity_3") continue;
    seen.add(entry.cardId);
    up.push(card);
  }

  const body = `
    ${head(gacha.name, `Gacha #${gacha.id}`)}
    <div class="panel">
      <h3>卡池信息</h3>
      <div class="row">
        ${kv("类型", esc(gacha.gachaType))}
        ${kv("时间", esc(timeRange(gacha.startAt, gacha.endAt)))}
      </div>
      <div class="hr"></div>
      <div class="row">
        <div class="kv"><span class="k">普通概率</span><span>${rateRow(normal)}</span></div>
        ${
          guarantee.length
            ? `<div class="kv"><span class="k">保底概率</span><span>${rateRow(guarantee)}</span></div>`
            : ""
        }
      </div>
    </div>
    ${
      up.length
        ? `<div class="panel"><h3>UP 卡池（按权重抽取）</h3><div class="grid">${up
            .map((c) => cardCell(c, characters, showTrained))
            .join("")}</div></div>`
        : ""
    }`;

  return htmlShell(body);
}

export function renderGachaResult(
  result: GachaResult,
  characters: Map<number, CompactCharacter>,
  showTrained: boolean,
): string {
  const counts = result.counts;
  const stat = Object.entries(counts)
    .map(
      ([rarity, n]) =>
        `${RARITY_NAME[rarity as keyof typeof RARITY_NAME]}×${n}`,
    )
    .join("　");
  const displayPulls = result.pulls.slice(0, 100);
  const truncated = result.pulls.length > displayPulls.length;

  const body = `
    ${head("抽卡结果", result.gacha.name)}
    <div class="panel">
      <div class="row">
        ${badge(esc(stat || "无"), "#7f9cf5")}
        <span class="muted">共 ${result.pulls.length} 抽</span>
      </div>
    </div>
    <div class="grid">
      ${displayPulls
        .map((p) => cardCell(p.card, characters, showTrained, p.guarantee ? "保底" : undefined))
        .join("")}
    </div>
    ${truncated ? `<div class="muted" style="margin-top:10px">…仅展示前 100 抽，共 ${result.pulls.length} 抽</div>` : ""}`;

  return htmlShell(body);
}
