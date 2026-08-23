import type { CompactMusic } from "../types";
import { jacketUrl } from "../data/sources";
import { DIFF_ABBR, DIFF_COLOR, esc, head, htmlShell, kv } from "./theme";
import { fillTemplate, loadUi } from "./ui";

export function renderMusicDetail(music: CompactMusic): string {
  const diffs = music.difficulties.map((difficulty) => `
    <div class="difficulty-tile" style="--diff-color:${DIFF_COLOR[difficulty.difficulty]}">
      <b>${difficulty.playLevel}</b><span>${DIFF_ABBR[difficulty.difficulty]}</span><small>${difficulty.totalNoteCount} notes</small>
    </div>`).join("");
  const categories = music.categories.map((category) => `<span class="chip" style="color:#8d80ea">${esc(category)}</span>`).join("");

  const body = fillTemplate(loadUi("templates/music-detail.html"), {
    HEAD: head(music.titleZh ?? music.title, `MUSIC #${music.id}`),
    JACKET: jacketUrl(music.assetbundleName),
    TITLE: esc(music.titleZh ?? music.title),
    MUSIC_ID: String(music.id),
    ORIGINAL: music.titleZh && music.titleZh !== music.title ? `<p class="music-original">${esc(music.title)}</p>` : "",
    META_ROWS: [
      kv("作词", esc(music.lyricist || "-")),
      kv("作曲", esc(music.composer || "-")),
      kv("编曲", esc(music.arranger || "-")),
      kv("演唱", esc(music.vocals?.join(" / ") || "-")),
    ].join(""),
    TAGS: categories || `<span class="muted">SEKAI</span>`,
    DIFF_TILES: diffs || `<span class="muted">暂无谱面数据</span>`,
    ARTIST: esc(music.artist ?? "Project Sekai"),
  });

  return htmlShell(body, { title: music.titleZh ?? music.title, kind: "landscape", ratio: 0.8, renderWidth: 1402 });
}