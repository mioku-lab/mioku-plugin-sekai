import type { CardAttr, CardRarity, MusicDifficulty } from "../types";

export const ATTR_NAME: Record<CardAttr, string> = {
  cute: "花",
  cool: "蓝",
  pure: "绿",
  happy: "黄",
};

export const ATTR_COLOR: Record<CardAttr, string> = {
  cute: "#f070b8",
  cool: "#3fb6e8",
  pure: "#9fd24a",
  happy: "#ffd166",
};

export const RARITY_NAME: Record<CardRarity, string> = {
  rarity_1: "1★",
  rarity_2: "2★",
  rarity_3: "3★",
  rarity_4: "4★",
  rarity_birthday: "生日",
};

export const RARITY_COLOR: Record<CardRarity, string> = {
  rarity_1: "#8fa3b8",
  rarity_2: "#42c6b6",
  rarity_3: "#7f9cf5",
  rarity_4: "#ffb454",
  rarity_birthday: "#f26d9b",
};

export const RARITY_STARS: Record<CardRarity, string> = {
  rarity_1: "★",
  rarity_2: "★★",
  rarity_3: "★★★",
  rarity_4: "★★★★",
  rarity_birthday: "🎂",
};

export const DIFF_ABBR: Record<MusicDifficulty, string> = {
  easy: "EZ",
  normal: "NM",
  hard: "HD",
  expert: "EX",
  master: "MA",
  append: "AP",
};

export const DIFF_COLOR: Record<MusicDifficulty, string> = {
  easy: "#6fbf73",
  normal: "#4aa3e8",
  hard: "#f0a63a",
  expert: "#e8604a",
  master: "#b46be8",
  append: "#3dd6d0",
};

export const EVENT_TYPE_NAME: Record<string, string> = {
  marathon: "马拉松活动",
  cheerful_carnival: "快乐嘉年华",
  world_bloom: "世界花活动",
};

export function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function fmtDate(ms: number): string {
  if (!ms) return "-";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function fmtDateShort(ms: number): string {
  if (!ms) return "-";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getMonth() + 1}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function timeRange(from: number, to: number): string {
  return `${fmtDateShort(from)} ~ ${fmtDateShort(to)}`;
}

export function htmlShell(body: string, opts: { width?: number; title?: string } = {}): string {
  const width = opts.width ?? 900;
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${width}px;
    background: linear-gradient(160deg, #191c2a 0%, #22263a 100%);
    color: #e8eaf2;
    font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif;
    padding: 22px 24px 26px;
  }
  .head { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
  .head .logo { font-size: 22px; font-weight: 700; letter-spacing: 1px; }
  .head .sub { font-size: 12px; color: #9aa1b5; }
  .panel {
    background: #262a3d;
    border: 1px solid #343950;
    border-radius: 14px;
    padding: 16px 18px;
    margin-bottom: 14px;
  }
  .panel h3 { font-size: 13px; color: #9aa1b5; margin-bottom: 10px; font-weight: 600; }
  .row { display: flex; flex-wrap: wrap; gap: 8px 22px; font-size: 14px; line-height: 1.7; }
  .kv { display: flex; gap: 6px; }
  .kv .k { color: #9aa1b5; min-width: 56px; flex-shrink: 0; }
  .badge {
    display: inline-block; padding: 2px 10px; border-radius: 999px;
    font-size: 12px; font-weight: 700; color: #fff; vertical-align: middle;
  }
  .name-zh { font-size: 21px; font-weight: 700; }
  .name-ja { font-size: 14px; color: #9aa1b5; margin-top: 2px; }
  .desc { font-size: 13px; color: #c3c8da; line-height: 1.8; margin-top: 8px; }
  .grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
  .cell { border-radius: 12px; overflow: hidden; background: #20243a; border: 2px solid #343950; }
  .cell img { width: 100%; display: block; aspect-ratio: 16 / 9; object-fit: cover; }
  .cell .cell-icon { aspect-ratio: 1 / 1; object-fit: contain; background: #20243a; padding: 4px; box-sizing: border-box; }
  .cell .cell-fallback { width: 100%; aspect-ratio: 1 / 1; display: flex; align-items: center; justify-content: center; font-size: 30px; font-weight: 800; }
  .cell .cap { padding: 6px 8px; font-size: 12px; line-height: 1.4; }
  .cell .cap .n { font-weight: 700; }
  .cell .cap .s { color: #9aa1b5; font-size: 11px; }
  .diff { display: inline-flex; flex-direction: column; align-items: center; min-width: 74px;
    border-radius: 10px; padding: 8px 6px; background: #20243a; }
  .diff .lv { font-size: 20px; font-weight: 800; }
  .diff .nm { font-size: 12px; color: #9aa1b5; margin-top: 2px; }
  .diff .ct { font-size: 11px; color: #6f768c; margin-top: 1px; }
  .hr { height: 1px; background: #343950; margin: 10px 0; }
  .muted { color: #9aa1b5; font-size: 12px; }
</style>
</head>
<body>
${body}
</body>
</html>`;
}

export function head(title: string, sub?: string): string {
  return `<div class="head"><div class="logo">${esc(title)}</div>${
    sub ? `<div class="sub">${esc(sub)}</div>` : ""
  }</div>`;
}

export function panel(title: string | null, body: string): string {
  return `<div class="panel">${title ? `<h3>${esc(title)}</h3>` : ""}${body}</div>`;
}

export function badge(text: string, color: string): string {
  return `<span class="badge" style="background:${color}">${esc(text)}</span>`;
}

export function kv(key: string, value: string): string {
  return `<div class="kv"><span class="k">${esc(key)}</span><span>${value}</span></div>`;
}
