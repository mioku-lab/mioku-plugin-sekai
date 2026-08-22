import type { CharacterProfile, CompactCharacter } from "../types";
import { characterIconUrl } from "../data/sources";
import { badge, esc, head, htmlShell, kv, panel } from "./theme";
import { charFullName } from "./card";

export function renderCharacterDetail(
  character: CompactCharacter,
  profile?: CharacterProfile,
): string {
  const unitName = character.unitName ?? character.unit;
  const unitColor = character.colorCode ?? "#888888";

  const rows = profile
    ? [
        kv("CV", esc(profile.voice)),
        kv("生日", esc(profile.birthday)),
        kv("身高", esc(profile.height)),
        kv("学校", esc(profile.school)),
        kv("班级", esc(profile.schoolYear)),
        kv("兴趣", esc(profile.hobby.replace(/\n/g, "、"))),
        kv("特长", esc(profile.specialSkill)),
        kv("喜欢的食物", esc(profile.favoriteFood)),
        kv("讨厌的食物", esc(profile.hatedFood)),
        kv("弱点", esc(profile.weak)),
      ]
    : [];

  const body = `
    ${head(charFullName(character), `Character #${character.id}`)}
    <div class="panel">
      <div class="row">
        <span class="badge" style="background:${unitColor}">${esc(unitName)}</span>
        <span style="font-size:13px;color:#9aa1b5">${esc(
          `${character.firstName ?? ""} ${character.givenName ?? ""}（${character.firstNameEn ?? ""} ${character.givenNameEn ?? ""}）`,
        )}</span>
      </div>
      ${profile ? `<div class="desc">${esc(profile.introduction)}</div>` : ""}
    </div>
    ${
      rows.length
        ? panel("档案", `<div class="row">${rows.join("")}</div>`)
        : ""
    }`;

  return htmlShell(body);
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
  const sortedKeys = [...groups.keys()].sort(
    (a, b) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    },
  );

  const body = `
    ${head("角色一览", `${characters.length} 名角色`)}
    ${sortedKeys
      .map((unit) => {
        const meta = unitMap[unit];
        const list = groups.get(unit) ?? [];
        const cells = list
          .map((c) => {
            const name = charFullName(c);
            const border = meta?.colorCode ?? "#343950";
            const bg = `${meta?.colorCode ?? "#20243a"}33`;
            const icon = c.iconFileName
              ? `<img class="cell-icon" src="${characterIconUrl(c.iconFileName)}" alt="${esc(name)}"/>`
              : `<div class="cell-fallback" style="background:${bg};color:${meta?.colorCode ?? "#c3c8da"}">${esc(name.slice(0, 1))}</div>`;
            return `<div class="cell" style="border-color:${border}">
              ${icon}
              <div class="cap"><div class="n">${esc(name)}</div><div class="s">#${c.id} ${esc(c.firstNameEn ?? "")} ${esc(c.givenNameEn ?? "")}</div></div>
            </div>`;
          })
          .join("");
        return `<div class="panel"><h3>${esc(meta?.unitName ?? unit)}</h3><div class="grid">${cells}</div></div>`;
      })
      .join("")}`;

  return htmlShell(body);
}
