import type { CardRarity, CompactCard, CompactCharacter, CompactGacha, GachaResult } from "../types";
import { cardImageUrl, gachaBannerUrl, gachaLogoUrl } from "../data/sources";
import { RARITY_COLOR, RARITY_NAME, badge, esc, fmtDateShort, head, htmlShell, timeRange } from "./theme";
import { cardTitle, charFullName } from "./card";
import { fillTemplate, loadUi } from "./ui";

const DETAIL_RARITY_INK: Record<CardRarity, string> = {
  rarity_1: "#687eb4",
  rarity_2: "#2b96c7",
  rarity_3: "#7c62da",
  rarity_4: "#e09a29",
  rarity_birthday: "#e0529b",
};

function clipIntro(raw: string | undefined, limit = 420): string {
  const s = (raw ?? "").trim();
  if (s.length <= limit) return s;
  const head = s.slice(0, limit);
  const br = head.lastIndexOf("\n\n");
  return `${br > limit * 0.5 ? head.slice(0, br) : head}…`;
}

function cardCell(
  card: CompactCard,
  characters: Map<number, CompactCharacter>,
  trained: boolean,
  extra?: string,
  showId = false,
): string {
  const rarityColor = RARITY_COLOR[card.rarity];
  const art = trained && card.hasTrained ? cardImageUrl(card.assetbundleName, true) : cardImageUrl(card.assetbundleName, false);
  const character = characters.get(card.characterId);
  const idBadge = showId && card.rarity !== "rarity_1" && card.rarity !== "rarity_2" ? `<span class="gacha-card-id">#${card.id}</span>` : "";
  return `<article class="gacha-card" style="--rarity-color:${rarityColor}"><div class="gacha-card-art">${idBadge}<img class="img-cover" src="${art}" alt="${esc(cardTitle(card))}"/></div><div class="gacha-card-copy"><b>${RARITY_NAME[card.rarity]}${extra ? ` · ${esc(extra)}` : ""}</b><span>${esc(cardTitle(card))}</span><small>${character ? esc(charFullName(character)) : `角色 #${card.characterId}`}</small></div></article>`;
}

function featureCard(card: CompactCard, characters: Map<number, CompactCharacter>, trained: boolean): string {
  const rarityColor = RARITY_COLOR[card.rarity];
  const art = trained && card.hasTrained ? cardImageUrl(card.assetbundleName, true) : cardImageUrl(card.assetbundleName, false);
  const character = characters.get(card.characterId);
  return `<article class="gacha-feature-card" style="--rarity-color:${rarityColor}"><div class="gacha-feature-art"><img src="${art}" alt="${esc(cardTitle(card))}"/></div><div class="gacha-feature-copy"><b>${RARITY_NAME[card.rarity]}</b><strong>${esc(cardTitle(card))}</strong><span>${character ? esc(charFullName(character)) : `角色 #${card.characterId}`}</span></div></article>`;
}

export function renderGachaInfo(
  gacha: CompactGacha,
  cardById: Map<number, CompactCard>,
  characters: Map<number, CompactCharacter>,
  showTrained: boolean,
): string {
  const normal = gacha.rates.filter((rate) => rate.lotteryType === "normal");
  const guarantee = gacha.rates.filter((rate) => rate.lotteryType === "guarantee");
  const rateRow = (list: typeof normal) => list.map((rate) => `<span class="rate-item"><b style="color:${DETAIL_RARITY_INK[rate.rarity]}">${RARITY_NAME[rate.rarity]}</b> ${rate.rate}%</span>`).join("");
  const seen = new Set<number>();
  const up: CompactCard[] = [];
  for (const cardId of gacha.gachaPickups ?? []) {
    if (up.length >= 4 || seen.has(cardId)) continue;
    const card = cardById.get(cardId);
    if (!card) continue;
    seen.add(cardId);
    up.push(card);
  }
  const tags = [
    gacha.isSelectCharacter ? badge("角色自选", "rgba(238, 93, 162, .82)") : "",
    gacha.wishSelectCount ? badge(`心愿选择 ${gacha.wishSelectCount} 张`, "rgba(111, 103, 221, .84)") : "",
  ].filter(Boolean).join(" ");
  const banner = gacha.assetbundleName
    ? `<img class="gacha-banner" src="${gachaBannerUrl(gacha.id)}" alt="" onerror="this.onerror=null;this.src='${gachaLogoUrl(gacha.assetbundleName)}'"/>`
    : `<div class="gacha-banner-fallback">✦ GACHA ✦</div>`;
  const showcase = `${up.length ? featureCard(up[0], characters, showTrained) : `<div class="gacha-feature-fallback">${banner}</div>`}${up.length > 1 ? `<div class="gacha-pickup-grid">${up.slice(1).map((card) => cardCell(card, characters, showTrained)).join("")}</div>` : ""}`;

  const body = fillTemplate(loadUi("templates/gacha-detail.html"), {
    LOGO: gacha.assetbundleName ? gachaLogoUrl(gacha.assetbundleName) : "",
    NAME: esc(gacha.name),
    TYPE: esc(gacha.gachaType),
    PERIOD: esc(timeRange(gacha.startAt, gacha.endAt)),
    NORMAL_RATES: rateRow(normal),
    GUARANTEE_ROW: guarantee.length ? `<div class="rate-row"><span class="rate-label">十连保底</span>${rateRow(guarantee)}</div>` : "",
    TAGS: tags ? `<div class="gacha-tags">${tags}</div>` : "",
    INFORMATION: gacha.gachaInformation ? `<div class="gacha-information glass-soft"><div class="gacha-information-title">卡池介绍</div><p>${esc(clipIntro(gacha.gachaInformation))}</p></div>` : "",
    SHOWCASE: showcase,
    UP_HEADING: up.length ? `<div class="up-heading"><span>UP MEMBERS</span><small>${up.length} PICKUPS</small></div>` : "",
    START: fmtDateShort(gacha.startAt),
    END: fmtDateShort(gacha.endAt),
  });

  return htmlShell(body, {
    title: gacha.name,
    kind: "landscape",
    ratio: 2 / 3,
    className: "gacha-detail-scene",
    renderWidth: 1536,
  });
}

export function renderGachaResult(
  result: GachaResult,
  characters: Map<number, CompactCharacter>,
  showTrained: boolean,
): string {
  const counts = Object.entries(result.counts).map(([rarity, count]) => `${RARITY_NAME[rarity as keyof typeof RARITY_NAME]} × ${count}`).join("　");
  const displayPulls = result.pulls.slice(0, 100);
  const body = fillTemplate(loadUi("templates/gacha-result.html"), {
    HEAD: head("抽卡结果", `${result.gacha.name} · ${result.pulls.length} PULLS`),
    NAME: esc(result.gacha.name),
    COUNTS_BADGE: badge(counts || "暂无结果", "rgba(103, 108, 213, .76)"),
    PULLS: String(result.pulls.length),
    CARDS: displayPulls.map((pull) => cardCell(pull.card, characters, showTrained, pull.guarantee ? "保底" : undefined, true)).join(""),
    TRUNCATED: result.pulls.length > displayPulls.length ? `<div class="muted result-truncated">仅展示前 ${displayPulls.length} 抽</div>` : "",
  });

  return htmlShell(body, { title: "抽卡结果", kind: "landscape", ratio: 0.46, renderWidth: 1619, className: "gacha-result-scene" });
}