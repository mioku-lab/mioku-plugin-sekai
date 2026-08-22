import type { CompactMusic } from "../types";
import { jacketUrl } from "../data/sources";
import {
  DIFF_ABBR,
  DIFF_COLOR,
  esc,
  head,
  htmlShell,
  kv,
} from "./theme";

export function renderMusicDetail(music: CompactMusic): string {
  const diffs = music.difficulties
    .map(
      (d) => `
      <div class="diff" style="border:2px solid ${DIFF_COLOR[d.difficulty]}55">
        <span class="lv" style="color:${DIFF_COLOR[d.difficulty]}">${d.playLevel}</span>
        <span class="nm">${DIFF_ABBR[d.difficulty]}</span>
        <span class="ct">${d.totalNoteCount} notes</span>
      </div>`,
    )
    .join("");

  const body = `
    ${head(music.titleZh ?? music.title, `Music #${music.id}`)}
    ${music.titleZh && music.titleZh !== music.title ? `<div class="name-ja" style="margin-bottom:12px">${esc(music.title)}</div>` : ""}
    <div class="panel" style="display:flex;gap:14px;align-items:center">
      <img src="${jacketUrl(music.assetbundleName)}" style="width:120px;height:120px;border-radius:12px;flex-shrink:0"/>
      <div style="flex:1">
        <div class="row">
          ${kv("作者", esc(music.artist ?? "-"))}
          ${kv("作词", esc(music.lyricist || "-"))}
          ${kv("作曲", esc(music.composer || "-"))}
          ${kv("编曲", esc(music.arranger || "-"))}
          ${music.vocals?.length ? kv("演唱", esc(music.vocals.join(" / "))) : ""}
        </div>
      </div>
    </div>
    <div class="panel">
      <h3>谱面</h3>
      <div style="display:flex;flex-wrap:wrap;gap:10px">
        ${diffs || `<span class="muted">暂无谱面数据</span>`}
      </div>
    </div>`;

  return htmlShell(body);
}
