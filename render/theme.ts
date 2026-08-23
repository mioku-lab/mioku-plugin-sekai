import { fileURLToPath, pathToFileURL } from "node:url";
import type { CardAttr, CardRarity, MusicDifficulty } from "../types";

export const ATTR_NAME: Record<CardAttr, string> = {
  cute: "花",
  cool: "蓝",
  pure: "绿",
  happy: "黄",
  mysterious: "紫",
};

export const ATTR_COLOR: Record<CardAttr, string> = {
  cute: "#f06baf",
  cool: "#3fb8e8",
  pure: "#74cf76",
  happy: "#ffc94d",
  mysterious: "#a875e8",
};

export const RARITY_NAME: Record<CardRarity, string> = {
  rarity_1: "1★",
  rarity_2: "2★",
  rarity_3: "3★",
  rarity_4: "4★",
  rarity_birthday: "生日",
};

export const RARITY_COLOR: Record<CardRarity, string> = {
  rarity_1: "#91a7ce",
  rarity_2: "#52bfe3",
  rarity_3: "#9b88ee",
  rarity_4: "#ffbf58",
  rarity_birthday: "#f46da8",
};

export const RARITY_STARS: Record<CardRarity, string> = {
  rarity_1: "★",
  rarity_2: "★★",
  rarity_3: "★★★",
  rarity_4: "★★★★",
  rarity_birthday: "✦",
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
  easy: "#8edc74",
  normal: "#55c9ec",
  hard: "#ffc54f",
  expert: "#ff716f",
  master: "#c786f0",
  append: "#55d8d8",
};

export const EVENT_TYPE_NAME: Record<string, string> = {
  marathon: "马拉松活动",
  cheerful_carnival: "快乐嘉年华",
  world_bloom: "世界花活动",
};

const sourceDir = new URL("../pjsk-source/", import.meta.url);
export const BACKGROUND_LANDSCAPE = pathToFileURL(
  fileURLToPath(new URL("background/横屏背景.png", sourceDir)),
).href;
export const BACKGROUND_PORTRAIT = pathToFileURL(
  fileURLToPath(new URL("background/竖屏背景.png", sourceDir)),
).href;

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

type SceneKind = "landscape" | "portrait";

const CSS = (width: number, kind: SceneKind, minHeightRatio: number) => `
  :root {
    --scene-width: ${width}px;
    --scene-min-height: ${Math.round(width * minHeightRatio)}px;
    --ink: #ffffff;
    --ink-soft: rgba(245, 249, 255, .82);
    --ink-muted: rgba(231, 240, 255, .7);
    --blue: #556fe0;
    --violet: #a36fe8;
    --cyan: #47c6e7;
    --glass: rgba(239, 247, 255, .48);
    --glass-strong: rgba(247, 251, 255, .68);
    --glass-dark: rgba(43, 73, 157, .44);
    --line: rgba(255, 255, 255, .66);
    --shadow: 0 16px 42px rgba(35, 68, 151, .22);
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; min-width: 0; }
  body {
    min-height: 0;
    overflow-x: hidden;
    color: var(--ink);
    font-family: "Avenir Next", "SF Pro Display", "PingFang SC", "Microsoft YaHei", sans-serif;
    background: #6b96ed url("${BACKGROUND_LANDSCAPE}") center top / cover fixed no-repeat;
    text-shadow: 0 1px 3px rgba(36, 61, 138, .28);
  }
  body::before {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(135deg, rgba(41, 90, 208, .2), rgba(126, 96, 235, .11) 56%, rgba(255, 146, 212, .12));
    z-index: 0;
  }
  body::after {
    content: "✦  ◇  ✦  ◇  ✦";
    position: fixed;
    right: 26px;
    bottom: 18px;
    color: rgba(255,255,255,.58);
    font-size: 13px;
    letter-spacing: 12px;
    pointer-events: none;
    z-index: 0;
  }
  .scene {
    position: relative;
    z-index: 1;
    width: 100%;
    min-height: var(--scene-min-height);
    padding: ${kind === "portrait" ? "34px 38px 42px" : "42px 52px 46px"};
  }
  .portrait-scene { background-image: url("${BACKGROUND_PORTRAIT}"); background-size: cover; background-position: center top; }
  .landscape-scene { background-image: url("${BACKGROUND_LANDSCAPE}"); background-size: cover; background-position: center top; }
  .brand-mark { display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,.9); font-size: 12px; letter-spacing: 3px; text-transform: uppercase; }
  .brand-mark::before { content: "◈"; color: #69e1ed; font-size: 22px; text-shadow: 0 0 12px rgba(100, 224, 255, .8); }
  .page-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 26px; }
  .page-head h1 { font-size: 34px; line-height: 1; font-weight: 800; letter-spacing: .02em; text-shadow: 0 3px 12px rgba(38, 65, 146, .42); }
  .page-head h1 small { display: block; margin-top: 9px; font-size: 11px; font-weight: 700; letter-spacing: .27em; opacity: .72; }
  .page-head .meta { color: var(--ink-muted); font-size: 13px; letter-spacing: .04em; }
  .glass {
    background: var(--glass);
    border: 1px solid var(--line);
    border-radius: 24px;
    box-shadow: var(--shadow), inset 0 1px 0 rgba(255,255,255,.6);
    backdrop-filter: blur(15px) saturate(125%);
  }
  .glass, .glass-soft { color: #344d99; text-shadow: none; --ink-soft: rgba(52, 77, 153, .88); --ink-muted: rgba(76, 99, 165, .78); }
  .glass .section-title, .glass-soft .section-title { color: #566fdd; text-shadow: none; }
  .glass .muted, .glass-soft .muted { color: #6178b1; }
  .glass-soft { background: rgba(235, 246, 255, .23); border: 1px solid rgba(255,255,255,.46); border-radius: 18px; backdrop-filter: blur(12px); }
  .section-title { display: flex; align-items: center; gap: 9px; color: #fff; font-size: 17px; font-weight: 800; letter-spacing: .03em; }
  .section-title::before { content: "✦"; color: var(--cyan); font-size: 17px; text-shadow: 0 0 10px rgba(93,224,255,.75); }
  .section-title .sub { color: var(--ink-muted); font-size: 11px; font-weight: 700; letter-spacing: .08em; }
  .muted { color: var(--ink-muted); font-size: 12px; }
  .tiny { color: var(--ink-muted); font-size: 11px; }
  .badge { display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; border: 1px solid rgba(255,255,255,.38); border-radius: 999px; color: #fff; font-size: 12px; font-weight: 800; letter-spacing: .02em; box-shadow: inset 0 1px 1px rgba(255,255,255,.35); }
  .chip { display: inline-flex; align-items: center; min-height: 25px; padding: 3px 11px; border: 1px solid currentColor; border-radius: 999px; background: rgba(255,255,255,.26); font-size: 12px; font-weight: 700; }
  .kv { display: flex; gap: 12px; align-items: baseline; min-width: 190px; font-size: 13px; line-height: 1.75; }
  .kv .k { flex: 0 0 auto; min-width: 62px; color: var(--ink-muted); font-size: 12px; }
  .hero-title { font-size: 42px; line-height: 1.05; font-weight: 900; letter-spacing: .01em; }
  .hero-subtitle { margin-top: 9px; color: var(--ink-soft); font-size: 14px; letter-spacing: .11em; }
  .divider { height: 1px; margin: 16px 0; background: linear-gradient(90deg, rgba(255,255,255,.62), transparent); }
  .footer-note { margin-top: 22px; color: rgba(255,255,255,.64); font-size: 11px; letter-spacing: .08em; text-align: center; }
  .avatar { width: 66px; height: 66px; border: 2px solid rgba(255,255,255,.8); border-radius: 50%; object-fit: cover; background: rgba(255,255,255,.35); box-shadow: 0 5px 17px rgba(29, 58, 145, .28); }
  .img-cover { width: 100%; height: 100%; display: block; object-fit: cover; }
  .img-contain { width: 100%; height: 100%; display: block; object-fit: contain; }
  .oneline { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .no-break { white-space: nowrap; }
  .eyebrow { color: var(--ink-muted); font-size: 11px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; }
  .detail-brand, .event-detail-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; color: var(--ink-muted); font-size: 12px; letter-spacing: .12em; }
  .character-layout, .event-detail-layout { display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); gap: 22px; align-items: stretch; }
  .character-hero { position: relative; min-height: 650px; overflow: hidden; }
  .character-hero { color: #fff; text-shadow: 0 1px 3px rgba(36, 61, 138, .28); --ink-soft: rgba(245, 249, 255, .82); --ink-muted: rgba(231, 240, 255, .7); }
  .character-hero::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 40%, rgba(24, 44, 115, .9)); pointer-events: none; }
  .character-portrait { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center top; }
  .character-hero-copy { position: absolute; left: 26px; right: 26px; bottom: 26px; z-index: 1; }
  .character-hero-copy h1 { margin: 8px 0 13px; font-size: 45px; line-height: 1; font-weight: 900; }
  .character-intro { max-width: 420px; margin-top: 18px; color: var(--ink-soft); font-size: 13px; line-height: 1.9; }
  .character-info { display: grid; gap: 16px; }
  .character-panel { padding: 20px 22px !important; }
  .profile-table { margin-top: 15px; }
  .profile-row { display: grid; grid-template-columns: 76px 1fr; gap: 14px; align-items: center; min-height: 45px; border-bottom: 1px dashed rgba(255,255,255,.44); color: var(--ink-muted); font-size: 12px; }
  .profile-row b { color: #fff; font-size: 14px; font-weight: 700; }
  .profile-chip-row { display: grid; grid-template-columns: 80px 1fr; gap: 9px; align-items: start; margin-top: 15px; }
  .profile-label { padding-top: 5px; color: var(--ink-muted); font-size: 12px; }
  .chips { display: flex; flex-wrap: wrap; gap: 7px; }
  .character-quote { padding: 15px 19px; color: #fff; font-size: 13px; line-height: 1.7; }
  .character-list { display: grid; gap: 18px; }
  .unit-panel { padding: 19px 22px 21px; }
  .unit-panel > h2 { display: flex; align-items: center; gap: 9px; color: var(--unit-color); font-size: 19px; font-weight: 900; }
  .unit-panel > h2 small { color: var(--ink-muted); font-size: 10px; font-weight: 700; letter-spacing: .15em; }
  .unit-icon { width: 25px; color: var(--unit-color); font-size: 22px; text-align: center; }
  .character-grid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 13px; margin-top: 16px; }
  .character-grid.six-col { grid-template-columns: repeat(6, minmax(0,1fr)); }
  .character-cell { position: relative; min-width: 0; overflow: hidden; border: 1px solid rgba(255,255,255,.66); border-radius: 16px; background: linear-gradient(160deg, rgba(255,255,255,.7), rgba(235,243,255,.28)); box-shadow: inset 0 1px 0 rgba(255,255,255,.72), 0 7px 17px rgba(41,70,149,.12); }
  .character-cell::before { content: ""; position: absolute; inset: 0 0 auto; height: 3px; background: var(--unit-color); }
  .character-cell > i { position: absolute; top: 8px; right: 9px; color: var(--unit-color); font-size: 16px; font-style: normal; }
  .character-icon, .character-icon-fallback { display: block; width: 100%; height: 136px; object-fit: contain; padding: 11px 13px 0; }
  .character-icon-fallback { display: flex; align-items: center; justify-content: center; font-size: 34px; font-weight: 900; }
  .character-cell-copy { padding: 0 11px 12px; color: #32447f; }
  .character-cell-copy b, .character-cell-copy span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .character-cell-copy b { font-size: 12px; font-weight: 900; }
  .character-cell-copy span { margin-top: 3px; color: #6375ac; font-size: 9px; letter-spacing: .03em; }
  .card-detail-shell { padding: 30px 32px 28px; }
  .card-detail-top { display: grid; grid-template-columns: 1fr 1.18fr; gap: 28px; align-items: center; }
  .card-badges { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 17px; }
  .character-name { color: var(--ink-muted); font-size: 13px; font-weight: 700; }
  .card-japanese { margin-top: 12px; color: var(--ink-muted); font-size: 13px; }
  .quote { margin-top: 16px; color: #425ba3; font-size: 13px; line-height: 1.7; }
  .stat-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .stat-tile { min-height: 91px; padding: 13px 14px; border: 1px solid rgba(255,255,255,.55); border-radius: 17px; background: rgba(245,250,255,.3); }
  .stat-tile span, .stat-tile b, .stat-tile small { display: block; }
  .stat-tile span { color: var(--cyan); font-size: 19px; }
  .stat-tile b { margin-top: 6px; font-size: 15px; }
  .stat-tile small { margin-top: 4px; color: var(--ink-muted); font-size: 10px; }
  .card-art-pair { display: grid; grid-template-columns: repeat(2, 1fr); gap: 19px; }
  .art-wrap { position: relative; min-width: 0; overflow: hidden; border: 1px solid rgba(255,255,255,.74); border-radius: 17px; background: rgba(31,59,133,.28); }
  .card-art { width: 100%; display: block; aspect-ratio: 1.47 / 1; object-fit: cover; }
  .art-label { position: absolute; top: 11px; left: 12px; padding: 4px 9px; border-radius: 999px; background: rgba(46,72,151,.62); color: #fff; font-size: 11px; }
  .art-empty { display: grid; place-items: center; min-height: 220px; color: var(--ink-muted); font-size: 12px; }
  .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 20px; }
  .info-panel { padding: 17px 18px !important; min-height: 112px; }
  .info-panel .section-title { font-size: 14px; }
  .info-lead { margin-top: 13px; font-size: 16px; font-weight: 800; }
  .info-copy { margin-top: 14px; color: var(--ink-soft); font-size: 12px; line-height: 1.8; }
  .music-shell { padding: 30px 34px 28px; }
  .music-top { display: grid; grid-template-columns: 38% 1fr; gap: 32px; align-items: center; }
  .music-jacket { aspect-ratio: 1; overflow: hidden; border: 3px solid rgba(255,255,255,.72); border-radius: 23px; box-shadow: 0 13px 28px rgba(25,50,128,.28); }
  .music-title { margin-top: 9px; font-size: 43px; line-height: 1.06; font-weight: 900; }
  .music-original { margin-top: 7px; color: var(--ink-muted); font-size: 15px; }
  .music-meta { display: grid; gap: 3px; margin-top: 22px; padding: 15px 18px; }
  .music-meta .kv { min-width: 0; }
  .music-tags { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 16px; }
  .difficulty-heading { display: flex; align-items: baseline; gap: 12px; margin-top: 31px; color: #fff; font-size: 16px; font-weight: 800; }
  .difficulty-heading small { color: var(--ink-muted); font-size: 10px; letter-spacing: .17em; }
  .difficulty-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 11px; margin-top: 13px; }
  .difficulty-tile { min-height: 120px; padding: 16px 8px 10px; border: 2px solid color-mix(in srgb, var(--diff-color) 75%, transparent); border-radius: 17px; background: rgba(72,98,182,.28); text-align: center; box-shadow: inset 0 1px 0 rgba(255,255,255,.32); }
  .difficulty-tile b, .difficulty-tile span, .difficulty-tile small { display: block; }
  .difficulty-tile b { color: var(--diff-color); font-size: 29px; line-height: 1; }
  .difficulty-tile span { margin-top: 8px; font-size: 13px; font-weight: 800; }
  .difficulty-tile small { margin-top: 8px; color: var(--ink-muted); font-size: 10px; }
  .event-title { max-width: 470px; margin-top: 10px; font-family: Georgia, "Songti SC", serif; font-size: 52px; line-height: .98; font-weight: 500; }
  .event-japanese { margin-top: 12px; color: var(--ink-muted); font-size: 14px; }
  .event-badges { display: flex; gap: 8px; margin-top: 20px; }
  .event-timeline { max-width: 500px; margin-top: 38px; padding: 15px 17px; }
  .timeline-title { margin-bottom: 8px; color: #526bd2; font-size: 12px; font-weight: 800; }
  .timeline-row { display: grid; grid-template-columns: 80px 1fr; gap: 12px; padding: 5px 0; color: #6378b0; font-size: 11px; }
  .timeline-row b { color: #344d99; font-weight: 700; }
  .timeline-range { margin-top: 8px; padding-top: 9px; border-top: 1px solid rgba(86,112,203,.25); color: #5269a5; font-size: 11px; }
  .event-visual { min-width: 0; min-height: 0; aspect-ratio: 1.63 / 1; overflow: hidden; padding: 9px; }
  .event-visual img { border-radius: 18px; }
  .ranking-panel { margin-top: 19px; padding: 17px 22px !important; }
  .ranking-panel .section-title { font-size: 14px; }
  .ranking-copy { margin-top: 13px; color: var(--ink-soft); font-size: 12px; line-height: 2; }
  .event-list { display: grid; gap: 16px; }
  .event-list-item { display: grid; grid-template-columns: 27% 1fr 30%; min-height: 118px; overflow: hidden; background: linear-gradient(110deg, rgba(42,67,144,.62), rgba(113,135,211,.48)); border-color: rgba(255,255,255,.62); }
  .event-list-image { min-height: 118px; background: rgba(37,65,142,.28); }
  .event-list-copy { min-width: 0; padding: 19px 18px; align-self: center; }
  .event-list-copy h2 { overflow: hidden; color: #fff; font-family: Georgia, "Songti SC", serif; font-size: 21px; line-height: 1.2; text-overflow: ellipsis; white-space: nowrap; text-shadow: 0 1px 4px rgba(28,45,112,.35); }
  .event-list-copy p { margin-top: 9px; color: rgba(236,243,255,.78); font-size: 11px; }
  .event-list-time { display: flex; flex-direction: column; justify-content: center; align-items: flex-end; gap: 7px; padding: 15px 19px; color: rgba(247,250,255,.92); font-size: 11px; text-align: right; text-shadow: 0 1px 4px rgba(28,45,112,.4); }
  .event-list-time span { color: #fff; }
  .gacha-shell { padding: 30px 32px 25px; }
  .gacha-layout { display: grid; grid-template-columns: 1fr .97fr; gap: 28px; align-items: stretch; }
  .gacha-title { margin-top: 10px; color: #fff; font-size: 39px; line-height: 1.1; font-weight: 900; }
  .gacha-period { margin-top: 9px; color: var(--ink-muted); font-size: 13px; }
  .gacha-rate-card { margin-top: 23px; padding: 15px 17px; }
  .rate-heading, .rate-label { color: var(--ink-muted); font-size: 11px; }
  .rate-row { display: flex; flex-wrap: wrap; gap: 13px; align-items: center; margin-top: 10px; color: #fff; font-size: 14px; }
  .rate-item { white-space: nowrap; }
  .rate-item b { margin-right: 3px; }
  .gacha-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
  .gacha-information { max-height: 143px; margin-top: 15px; padding: 13px 15px; overflow: hidden; color: var(--ink-muted); font-size: 11px; line-height: 1.8; white-space: pre-wrap; }
  .gacha-banner-wrap { position: relative; aspect-ratio: 1.5 / 1; overflow: hidden; border: 2px solid rgba(255,255,255,.72); border-radius: 22px; background: linear-gradient(145deg, rgba(245,186,240,.55), rgba(65, 91, 192, .52)); box-shadow: 0 14px 30px rgba(46,51,143,.24); }
  .gacha-banner { width: 100%; height: 100%; display: block; object-fit: cover; }
  .gacha-banner-fallback { display: grid; height: 100%; place-items: center; color: #fff; font-size: 31px; font-weight: 900; }
  .banner-caption { position: absolute; right: 0; bottom: 0; left: 0; padding: 13px 16px; background: linear-gradient(transparent, rgba(26,30,100,.82)); color: #fff; font-size: 16px; font-weight: 800; }
  .banner-caption span { display: block; margin-top: 4px; color: var(--ink-muted); font-size: 10px; letter-spacing: .16em; text-transform: uppercase; }
  .up-heading { display: flex; align-items: baseline; gap: 12px; margin-top: 25px; color: #fff; font-size: 15px; font-weight: 900; letter-spacing: .14em; }
  .up-heading small { color: var(--ink-muted); font-size: 10px; letter-spacing: .08em; }
  .gacha-grid, .result-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 11px; margin-top: 13px; }
  .gacha-card { min-width: 0; overflow: hidden; border: 2px solid color-mix(in srgb, var(--rarity-color) 80%, white); border-radius: 15px; background: rgba(38,42,124,.58); box-shadow: 0 8px 16px rgba(31,48,135,.2); }
  .gacha-card-art { height: 106px; background: rgba(255,255,255,.2); }
  .gacha-card-copy { min-height: 68px; padding: 8px 9px 9px; }
  .gacha-card-copy b, .gacha-card-copy span, .gacha-card-copy small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .gacha-card-copy b { color: var(--rarity-color); font-size: 12px; }
  .gacha-card-copy span { margin-top: 4px; color: #fff; font-size: 10px; }
  .gacha-card-copy small { margin-top: 3px; color: var(--ink-muted); font-size: 9px; }
  .result-summary { display: flex; align-items: end; justify-content: space-between; gap: 20px; margin: 0 0 19px; }
  .result-summary h2 { margin-top: 6px; font-size: 21px; font-weight: 800; }
  .result-counts { display: flex; align-items: center; gap: 12px; color: var(--ink-muted); font-size: 12px; }
  .result-shell { padding: 22px; }
  .result-grid { grid-template-columns: repeat(5, 1fr); gap: 15px; margin-top: 0; }
  .result-grid .gacha-card-art { height: 124px; }
  .result-grid .gacha-card-copy { min-height: 69px; }
  .result-truncated { margin-top: 12px; text-align: center; }
  @media (max-width: 720px) {
    .scene { padding-left: 22px; padding-right: 22px; }
    .page-head h1 { font-size: 28px; }
    .hero-title { font-size: 34px; }
  }
`;

export function htmlShell(
  body: string,
  opts: { width?: number; title?: string; kind?: SceneKind; ratio?: number } = {},
): string {
  const width = opts.width ?? 900;
  const kind = opts.kind ?? "landscape";
  const ratio = opts.ratio ?? (kind === "portrait" ? 1.24 : 0.64);
  return `<!doctype html>
<html lang="zh-CN">
<head><meta charset="utf-8"/><meta name="viewport" content="width=${width}"/><title>${esc(opts.title ?? "Project Sekai")}</title><style>${CSS(width, kind, ratio)}</style></head>
<body><main class="scene ${kind}-scene" data-height-ratio="${ratio}">${body}</main></body>
</html>`;
}

export function head(title: string, sub?: string): string {
  return `<header class="page-head"><div><div class="brand-mark">PROJECT SEKAI</div><h1>${esc(title)}<small>HATSUNE MIKU: COLORFUL STAGE!</small></h1></div>${sub ? `<div class="meta">${esc(sub)}</div>` : ""}</header>`;
}

export function panel(title: string | null, body: string, className = "glass"): string {
  return `<section class="${className}" style="padding:22px 24px">${title ? `<h2 class="section-title">${esc(title)}</h2>` : ""}${body}</section>`;
}

export function badge(text: string, color: string): string {
  return `<span class="badge" style="background:${color}">${esc(text)}</span>`;
}

export function kv(key: string, value: string): string {
  return `<div class="kv"><span class="k">${esc(key)}</span><span>${value}</span></div>`;
}
