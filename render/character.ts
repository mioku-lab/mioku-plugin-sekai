import type { CharacterProfile, CompactCard, CompactCharacter } from "../types";
import { cardImageUrl, characterFullUrl, characterIconUrl } from "../data/sources";
import { badge, esc, head, htmlShell, panel } from "./theme";
import { charFullName } from "./card";

const UNIT_ICON: Record<string, string> = {
  light_sound: "♫",
  idol: "☘",
  street: "✤",
  theme_park: "♛",
  school_refusal: "☾",
  piapro: "〽",
};

function profileRows(profile: CharacterProfile): string {
  return [
    ["CV", profile.voice],
    ["生日", profile.birthday],
    ["身高", profile.height],
    ["学校", profile.school],
    ["班级", profile.schoolYear],
  ]
    .map(([key, value]) => `<div class="profile-row"><span>${esc(key)}</span><b>${esc(value || "-")}</b></div>`)
    .join("");
}

function chips(label: string, value: string): string {
  const items = value
    .split(/[\n、，,]/)
    .map((item) => item.trim())
    .filter(Boolean);
  return `<div class="profile-chip-row"><span class="profile-label">${esc(label)}</span><div class="chips">${(items.length ? items : ["-"]).map((item) => `<span class="chip" style="color:#8d72db">${esc(item)}</span>`).join("")}</div></div>`;
}

export function renderCharacterDetail(
  character: CompactCharacter,
  profile?: CharacterProfile,
  showcaseCard?: CompactCard,
): string {
  const unitName = character.unitName ?? character.unit;
  const unitColor = character.colorCode ?? "#6c87e9";
  const icon = character.iconFileName ? characterIconUrl(character.iconFileName) : "";
  const fallback = showcaseCard ? cardImageUrl(showcaseCard.assetbundleName, false) : icon;
  const portrait = character.modelName ? characterFullUrl(character.modelName) : fallback;
  const image = `<img class="character-portrait" src="${portrait}" alt="${esc(charFullName(character))}" onerror="this.onerror=null;this.src='${fallback}'"/>`;
  const basic = profile ? profileRows(profile) : `<p class="muted">暂无角色档案</p>`;
  const profileText = profile?.introduction
    ? `<p class="character-intro">${esc(profile.introduction)}</p>`
    : `<p class="character-intro">暂无角色简介</p>`;
  const detail = profile
    ? [
        chips("兴趣", profile.hobby),
        chips("特长", profile.specialSkill),
        chips("喜欢的食物", profile.favoriteFood),
        chips("讨厌的食物", profile.hatedFood),
        chips("弱点", profile.weak),
      ].join("")
    : "";

  const body = `
    <div class="detail-brand"><div class="brand-mark">CHARACTER PROFILE</div><span>#${character.id}</span></div>
    <div class="character-layout">
      <section class="character-hero glass-soft">
        ${image}
        <div class="character-hero-copy">
          <div class="eyebrow">${esc(character.firstNameEn ?? "")} ${esc(character.givenNameEn ?? "")}</div>
          <h1>${esc(charFullName(character))}</h1>
          ${badge(`${UNIT_ICON[character.unit] ?? "✦"} ${unitName}`, unitColor)}
          ${profileText}
        </div>
      </section>
      <div class="character-info">
        ${panel("基本信息", `<div class="profile-table">${basic}</div>`, "glass character-panel")}
        ${panel("个人档案", detail || `<p class="muted">暂无详细档案</p>`, "glass character-panel")}
        <div class="character-quote glass-soft">✦ ${esc(profile?.introduction?.split(/[。！？]/)[0] || "一起去创造属于我们的舞台吧")}。</div>
      </div>
    </div>
    <div class="footer-note">✦ HATSUNE MIKU: COLORFUL STAGE! · CHARACTER ARCHIVE ✦</div>`;

  return htmlShell(body, { title: charFullName(character), kind: "landscape", ratio: 0.8 });
}

export function renderCharacterList(
  characters: CompactCharacter[],
  unitMap: Record<string, { unitName?: string; colorCode?: string }>,
): string {
  const groups = new Map<string, CompactCharacter[]>();
  for (const c of characters) {
    const key = c.unit || "other";
    const list = groups.get(key) ?? [];
    list.push(c);
    groups.set(key, list);
  }
  const order = ["light_sound", "idol", "street", "theme_park", "school_refusal", "piapro", "other"];
  const sortedKeys = [...groups.keys()].sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });

  const body = `
    ${head("角色列表", `${characters.length} MEMBERS`)}
    <div class="character-list">
      ${sortedKeys.map((unit) => {
        const meta = unitMap[unit];
        const list = groups.get(unit) ?? [];
        const color = meta?.colorCode ?? "#7f9dec";
        const cells = list.map((c) => {
          const name = charFullName(c);
          const icon = c.iconFileName
            ? `<img class="character-icon" src="${characterIconUrl(c.iconFileName)}" alt="${esc(name)}"/>`
            : `<div class="character-icon-fallback" style="color:${color}">${esc(name.slice(0, 1))}</div>`;
          return `<article class="character-cell" style="--unit-color:${color}">${icon}<div class="character-cell-copy"><b>${esc(name)}</b><span>#${c.id} ${esc(`${c.firstNameEn ?? ""} ${c.givenNameEn ?? ""}`.trim())}</span></div><i>✦</i></article>`;
        }).join("");
        return `<section class="unit-panel glass" style="--unit-color:${color}"><h2><span class="unit-icon">${UNIT_ICON[unit] ?? "✦"}</span>${esc(meta?.unitName ?? unit)}<small>${list.length} MEMBERS</small></h2><div class="character-grid ${list.length > 4 ? "six-col" : ""}">${cells}</div></section>`;
      }).join("")}
    </div>
    <div class="footer-note">✦ 点击角色卡片可查看详细资料 · PROJECT SEKAI ✦</div>`;

  return htmlShell(body, { title: "角色列表", kind: "portrait", ratio: 1.53 });
}
