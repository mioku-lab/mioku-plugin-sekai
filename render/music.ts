import type { CompactMusic } from "../types";
import { jacketUrl } from "../data/sources";
import { DIFF_ABBR, DIFF_COLOR, esc, head, htmlShell, kv } from "./theme";

export function renderMusicDetail(music: CompactMusic): string {
  const diffs = music.difficulties.map((difficulty) => `
    <div class="difficulty-tile" style="--diff-color:${DIFF_COLOR[difficulty.difficulty]}">
      <b>${difficulty.playLevel}</b><span>${DIFF_ABBR[difficulty.difficulty]}</span><small>${difficulty.totalNoteCount} notes</small>
    </div>`).join("");
  const categories = music.categories.map((category) => `<span class="chip" style="color:#8d80ea">${esc(category)}</span>`).join("");
  const body = `
    ${head(music.titleZh ?? music.title, `MUSIC #${music.id}`)}
    <section class="glass music-shell">
      <div class="music-top">
        <div class="music-jacket"><img class="img-cover" src="${jacketUrl(music.assetbundleName)}" alt="${esc(music.titleZh ?? music.title)}"/></div>
        <div class="music-copy">
          <div class="eyebrow">Music #${music.id}</div>
          <h2 class="music-title">${esc(music.titleZh ?? music.title)}</h2>
          ${music.titleZh && music.titleZh !== music.title ? `<p class="music-original">${esc(music.title)}</p>` : ""}
          <div class="music-meta glass-soft">
            ${kv("作词", esc(music.lyricist || "-"))}
            ${kv("作曲", esc(music.composer || "-"))}
            ${kv("编曲", esc(music.arranger || "-"))}
            ${kv("演唱", esc(music.vocals?.join(" / ") || "-"))}
          </div>
          <div class="music-tags">${categories || `<span class="muted">SEKAI</span>`}</div>
        </div>
      </div>
      <div class="difficulty-heading"><span>谱面难度</span><small>DIFFICULTY</small></div>
      <div class="difficulty-grid">${diffs || `<span class="muted">暂无谱面数据</span>`}</div>
    </section>
    <div class="footer-note">✦ MUSIC ARCHIVE · ${esc(music.artist ?? "Project Sekai")}</div>`;

  return htmlShell(body, { title: music.titleZh ?? music.title, kind: "landscape", ratio: 0.8 });
}
