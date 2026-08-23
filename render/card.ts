import type { CompactCard, CompactCharacter } from "../types";
import { cardImageUrl } from "../data/sources";
import {
  ATTR_COLOR,
  ATTR_NAME,
  RARITY_COLOR,
  RARITY_NAME,
  RARITY_STARS,
  badge,
  esc,
  fmtDate,
  head,
  htmlShell,
  kv,
  panel,
} from "./theme";

export function cardTitle(card: CompactCard): string {
  return card.prefixZh ?? card.prefix;
}

export function charFullName(c: CompactCharacter): string {
  if (c.nameZh) return c.nameZh;
  return `${c.firstName ?? ""}${c.givenName ?? ""}`;
}

export function charSearchFields(c: CompactCharacter): string[] {
  const fn = c.firstName ?? "";
  const gn = c.givenName ?? "";
  const fnEn = c.firstNameEn ?? "";
  const gnEn = c.givenNameEn ?? "";
  return [charFullName(c), `${fn}${gn}`, fn, gn, `${fnEn} ${gnEn}`.trim(), fnEn, gnEn];
}

export function cardSearchFields(card: CompactCard, char?: CompactCharacter): string[] {
  return [card.prefixZh ?? "", card.prefix, ...(char ? charSearchFields(char) : [])];
}

const MATERIAL_ZH: Record<number, string> = {
  6: "可爱宝石",
  7: "酷炫宝石",
  8: "纯净宝石",
  9: "开心宝石",
  10: "神秘宝石",
  14: "奇迹宝石",
  57: "愿望之滴",
};

function materialName(materials: Record<number, string> | undefined, id: number): string {
  return MATERIAL_ZH[id] ?? materials?.[id] ?? `素材#${id}`;
}

function art(src: string, label: string, className = "card-art"): string {
  return `<div class="art-wrap"><img class="${className}" src="${src}" alt="${esc(label)}"/><span class="art-label">${esc(label)}</span></div>`;
}

export function renderCardDetail(
  card: CompactCard,
  character?: CompactCharacter,
  materials?: Record<number, string>,
): string {
  const rarityColor = RARITY_COLOR[card.rarity];
  const attrName = ATTR_NAME[card.attr];
  const attrColor = ATTR_COLOR[card.attr];
  const charName = character ? charFullName(character) : `角色 #${card.characterId}`;
  const phrase = card.gachaPhraseZh ?? card.gachaPhrase;
  const costs = (card.specialTrainingCosts ?? [])
    .map((c) => `${materialName(materials, c.resourceId)} × ${c.quantity}`)
    .join("、");
  const trained = card.hasTrained ? cardImageUrl(card.assetbundleName, true) : undefined;

  const body = `
    ${head(cardTitle(card), `CARD #${card.id}`)}
    <section class="glass card-detail-shell">
      <div class="card-detail-top">
        <div>
          <div class="eyebrow">CARD #${card.id}</div>
          <h2 class="hero-title" style="color:${rarityColor}">${esc(cardTitle(card))}</h2>
          <div class="card-badges">${badge(`${RARITY_NAME[card.rarity]} ${RARITY_STARS[card.rarity]}`, rarityColor)} ${badge(`${attrName}属性`, attrColor)} <span class="character-name">${esc(charName)}</span></div>
          ${card.prefixZh && card.prefix !== card.prefixZh ? `<div class="card-japanese">${esc(card.prefix)}</div>` : ""}
          ${phrase ? `<p class="quote">「${esc(phrase)}」</p>` : ""}
        </div>
        <div class="stat-strip">
          <div class="stat-tile"><span>✦</span><b>${card.maxPower ?? "-"}</b><small>综合力${card.trainedPower ? ` / ${card.trainedPower}` : ""}</small></div>
          <div class="stat-tile"><span>▣</span><b>${fmtDate(card.releaseAt).slice(0, 10)}</b><small>实装日期</small></div>
          <div class="stat-tile"><span>▤</span><b>${card.archivePublishedAt ? fmtDate(card.archivePublishedAt).slice(0, 10) : "-"}</b><small>进档案时间</small></div>
        </div>
      </div>
      <div class="divider"></div>
      <div class="card-art-pair">
        ${art(cardImageUrl(card.assetbundleName, false), "通常")}
        ${trained ? art(trained, "特训后") : `<div class="art-wrap art-empty"><span>暂无特训卡面</span></div>`}
      </div>
      <div class="info-grid">
        ${panel("技能", `<p class="info-lead">${esc(card.cardSkillNameZh ?? card.cardSkillName)}</p><p class="muted">SKILL ID ${card.skillId}</p>`, "glass-soft info-panel")}
        ${panel("卡池台词", `<p class="info-copy">${phrase ? esc(phrase) : "暂无台词记录"}</p>`, "glass-soft info-panel")}
        ${panel("卡牌文案", `<p class="info-copy">${esc(card.prefixZh ?? card.prefix)}</p>`, "glass-soft info-panel")}
        ${panel("特训素材", `<p class="info-copy">${costs ? esc(costs) : "无需特训"}</p>`, "glass-soft info-panel")}
      </div>
    </section>
    <div class="footer-note">✦ PROJECT SEKAI · CARD ARCHIVE ✦</div>`;

  return htmlShell(body, { title: cardTitle(card), kind: "landscape", ratio: 1.17, renderWidth: 1159 });
}
