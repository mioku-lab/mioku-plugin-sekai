import type { CompactCard, CompactCharacter, CompactGacha, GachaResult } from "../types";
import { cardImageUrl, gachaBannerUrl, gachaLogoUrl } from "../data/sources";
import { RARITY_COLOR, RARITY_NAME, badge, esc, fmtDateShort, head, htmlShell, panel, timeRange } from "./theme";
import { cardTitle, charFullName } from "./card";

function cardCell(
  card: CompactCard,
  characters: Map<number, CompactCharacter>,
  trained: boolean,
  extra?: string,
): string {
  const rarityColor = RARITY_COLOR[card.rarity];
  const art = trained && card.hasTrained ? cardImageUrl(card.assetbundleName, true) : cardImageUrl(card.assetbundleName, false);
  const character = characters.get(card.characterId);
  return `<article class="gacha-card" style="--rarity-color:${rarityColor}"><div class="gacha-card-art"><img class="img-cover" src="${art}" alt="${esc(cardTitle(card))}"/></div><div class="gacha-card-copy"><b>${RARITY_NAME[card.rarity]}${extra ? ` · ${esc(extra)}` : ""}</b><span>${esc(cardTitle(card))}</span><small>${character ? esc(charFullName(character)) : `角色 #${card.characterId}`}</small></div></article>`;
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
  const rateRow = (list: typeof normal) => list.map((rate) => `<span class="rate-item"><b style="color:${RARITY_COLOR[rate.rarity]}">${RARITY_NAME[rate.rarity]}</b> ${rate.rate}%</span>`).join("");
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

  const body = `
    <div class="gacha-detail-mark"><img class="gacha-logo" src="${gacha.assetbundleName ? gachaLogoUrl(gacha.assetbundleName) : ""}" alt="" onerror="this.style.display='none'"/><span>PROJECT SEKAI</span></div>
    <section class="gacha-shell gacha-detail-frame">
      <div class="gacha-detail-layout">
        <div class="gacha-copy">
          <h2 class="gacha-title">${esc(gacha.name)}</h2>
          <div class="gacha-meta-card glass-soft"><div class="gacha-meta-item"><span>类型</span><b>${esc(gacha.gachaType)}</b></div><div class="gacha-meta-item"><span>举办期间</span><b>${esc(timeRange(gacha.startAt, gacha.endAt))}</b></div></div>
          <div class="gacha-rate-card glass-soft"><div class="rate-heading">出現概率</div><div class="rate-row">${rateRow(normal)}</div>${guarantee.length ? `<div class="rate-row"><span class="rate-label">十连保底</span>${rateRow(guarantee)}</div>` : ""}</div>
          ${tags ? `<div class="gacha-tags">${tags}</div>` : ""}
          ${gacha.gachaInformation ? `<div class="gacha-information glass-soft"><div class="gacha-information-title">卡池介绍</div><p>${esc(gacha.gachaInformation).slice(0, 520)}</p></div>` : ""}
        </div>
        <div class="gacha-showcase">${up.length ? featureCard(up[0], characters, showTrained) : `<div class="gacha-feature-fallback">${banner}</div>`}${up.length > 1 ? `<div class="gacha-pickup-grid">${up.slice(1).map((card) => cardCell(card, characters, showTrained)).join("")}</div>` : ""}</div>
      </div>
      ${up.length ? `<div class="up-heading"><span>UP MEMBERS</span><small>${up.length} PICKUPS</small></div>` : ""}
    </section>
    <div class="footer-note">✦ GACHA ARCHIVE · ${fmtDateShort(gacha.startAt)} — ${fmtDateShort(gacha.endAt)} ✦</div>`;

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
  const body = `
    ${head("抽卡结果", `${result.gacha.name} · ${result.pulls.length} PULLS`)}
    <div class="result-summary"><div><span class="eyebrow">RESULT SUMMARY</span><h2>${esc(result.gacha.name)}</h2></div><div class="result-counts">${badge(counts || "暂无结果", "rgba(103, 108, 213, .76)")}<span>共 ${result.pulls.length} 抽</span></div></div>
    <section class="glass result-shell"><div class="result-grid">${displayPulls.map((pull) => cardCell(pull.card, characters, showTrained, pull.guarantee ? "保底" : undefined)).join("")}</div></section>
    ${result.pulls.length > displayPulls.length ? `<div class="muted result-truncated">仅展示前 ${displayPulls.length} 抽</div>` : ""}
    <div class="footer-note">✦ GACHA RESULT · PROJECT SEKAI ✦</div>`;

  return htmlShell(body, { title: "抽卡结果", kind: "landscape", ratio: 0.6, renderWidth: 1619 });
}
