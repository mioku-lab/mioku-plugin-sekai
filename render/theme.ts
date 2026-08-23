import { fileURLToPath, pathToFileURL } from "node:url";
import { fillTemplate, loadUi } from "./ui";
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

const CSS = loadUi("theme.css")
  .split("__BG_LANDSCAPE__").join(BACKGROUND_LANDSCAPE)
  .split("__BG_PORTRAIT__").join(BACKGROUND_PORTRAIT);
const SHELL = loadUi("shell.html");

export function htmlShell(
  body: string,
  opts: { width?: number; title?: string; kind?: SceneKind; ratio?: number; className?: string; renderWidth?: number } = {},
): string {
  const width = opts.width ?? 900;
  const kind = opts.kind ?? "landscape";
  const ratio = opts.ratio ?? (kind === "portrait" ? 1.24 : 0.64);
  return fillTemplate(SHELL, {
    WIDTH: String(width),
    TITLE: esc(opts.title ?? "Project Sekai"),
    STYLE: CSS,
    SCENE_CLASSES: `scene ${kind}-scene ${opts.className ?? ""}`.trim(),
    SCENE_WIDTH: String(width),
    SCENE_MIN_HEIGHT: String(Math.round(width * ratio)),
    RATIO: String(ratio),
    RENDER_WIDTH_ATTR: opts.renderWidth ? ` data-render-width="${opts.renderWidth}"` : "",
    BODY: body,
  });
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
