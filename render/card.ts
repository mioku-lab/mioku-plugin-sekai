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
  return [
    charFullName(c),
    `${fn}${gn}`,
    fn,
    gn,
    `${fnEn} ${gnEn}`.trim(),
    fnEn,
    gnEn,
  ];
}

export function cardSearchFields(card: CompactCard, char?: CompactCharacter): string[] {
  return [
    card.prefixZh ?? "",
    card.prefix,
    ...(char ? charSearchFields(char) : []),
  ];
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

export function renderCardDetail(
  card: CompactCard,
  character?: CompactCharacter,
  materials?: Record<number, string>,
): string {
  const rarityColor = RARITY_COLOR[card.rarity];
  const art = cardImageUrl(card.assetbundleName, false);
  const trained = card.hasTrained ? cardImageUrl(card.assetbundleName, true) : undefined;
  const attrName = ATTR_NAME[card.attr];
  const attrColor = ATTR_COLOR[card.attr];
  const charName = character ? charFullName(character) : `角色 #${card.characterId}`;
  const phrase = card.gachaPhraseZh ?? card.gachaPhrase;
  const costs = (card.specialTrainingCosts ?? [])
    .map((c) => `${materialName(materials, c.resourceId)}×${c.quantity}`)
    .join("、");

  const body = `
    ${head(cardTitle(card), `Card #${card.id}`)}
    <div class="panel">
      <div class="row">
        ${badge(`${RARITY_NAME[card.rarity]} ${RARITY_STARS[card.rarity]}`, rarityColor)}
        ${badge(`${attrName}属性`, attrColor)}
        <span style="font-size:13px;color:#9aa1b5">${esc(charName)}</span>
      </div>
      ${card.prefixZh ? `<div class="name-ja" style="color:#c3c8da">${esc(card.prefix)}</div>` : ""}
      ${
        phrase
          ? `<div style="margin-top:8px;color:#e8dcc8;font-size:13px;line-height:1.6">「${esc(phrase)}」</div>`
          : ""
      }
    </div>
    <div class="panel">
      <h3>卡面</h3>
      <div style="display:flex;gap:12px">
        <div style="flex:1">
          <img src="${art}" style="width:100%;border-radius:10px;display:block"/>
          <div class="muted" style="margin-top:4px">通常</div>
        </div>
        ${
          trained
            ? `<div style="flex:1">
                <img src="${trained}" style="width:100%;border-radius:10px;display:block"/>
                <div class="muted" style="margin-top:4px">特训后</div>
              </div>`
            : ""
        }
      </div>
    </div>
    <div class="panel">
      <h3>信息</h3>
      <div class="row">
        ${kv("技能", esc(card.cardSkillNameZh ?? card.cardSkillName))}
        ${kv(
          "综合力",
          `${card.maxPower ?? "-"}${
            card.trainedPower ? ` / 特训后 ${card.trainedPower}` : ""
          }`,
        )}
        ${kv("实装", fmtDate(card.releaseAt))}
        ${
          card.archivePublishedAt
            ? kv("进档案", fmtDate(card.archivePublishedAt))
            : ""
        }
        ${costs ? kv("特训消耗", esc(costs)) : ""}
      </div>
    </div>`;

  return htmlShell(body);
}
