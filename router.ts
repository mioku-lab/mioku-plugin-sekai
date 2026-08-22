export type SekaiCommand =
  | { type: "characters" }
  | { type: "character"; query: string }
  | { type: "card"; query: string }
  | { type: "music"; query: string }
  | { type: "event"; count?: number }
  | { type: "gacha" }
  | { type: "roll"; pulls: number }
  | { type: "search"; query: string }
  | { type: "refresh" }
  | { type: "none" };

const PREFIX = /^(?:pjsk|pj|sekai|世界计划)/i;

function parsePulls(arg: string): number {
  const q = arg.trim();
  if (q === "十连" || q === "10连") return 10;
  if (q === "单抽") return 1;
  if (/^\d+$/.test(q)) return Number(q);
  return 0;
}

interface CommandSpec {
  word: string;
  type: SekaiCommand["type"];
}

const COMMAND_SPECS: CommandSpec[] = [
  { word: "角色列表", type: "characters" },
  { word: "characters", type: "characters" },
  { word: "数据更新", type: "refresh" },
  { word: "角色", type: "character" },
  { word: "character", type: "character" },
  { word: "chara", type: "character" },
  { word: "卡牌", type: "card" },
  { word: "卡", type: "card" },
  { word: "card", type: "card" },
  { word: "曲谱", type: "music" },
  { word: "歌曲", type: "music" },
  { word: "曲", type: "music" },
  { word: "music", type: "music" },
  { word: "song", type: "music" },
  { word: "活动", type: "event" },
  { word: "event", type: "event" },
  { word: "卡池", type: "gacha" },
  { word: "池", type: "gacha" },
  { word: "gacha", type: "gacha" },
  { word: "抽卡", type: "roll" },
  { word: "扭蛋", type: "roll" },
  { word: "十连", type: "roll" },
  { word: "单抽", type: "roll" },
  { word: "roll", type: "roll" },
  { word: "搜索", type: "search" },
  { word: "search", type: "search" },
  { word: "刷新", type: "refresh" },
  { word: "refresh", type: "refresh" },
  { word: "update", type: "refresh" },
];

const COMMANDS: CommandSpec[] = COMMAND_SPECS.sort(
  (a, b) => b.word.length - a.word.length,
);

export function parseSekaiCommand(text: string): SekaiCommand {
  const trimmed = text.trim();
  const m = trimmed.match(PREFIX);
  if (!m) return { type: "none" };
  const rest = trimmed.slice(m[0].length);
  if (!rest) return { type: "none" };

  const lower = rest.toLowerCase();
  for (const { word, type } of COMMANDS) {
    if (!lower.startsWith(word)) continue;
    const arg = rest.slice(word.length).trim();
    switch (type) {
      case "characters":
        return { type: "characters" };
      case "character":
        return { type: "character", query: arg };
      case "card":
        return { type: "card", query: arg };
      case "music":
        return { type: "music", query: arg };
      case "event":
        return { type: "event", count: /^\d+$/.test(arg) ? Number(arg) : undefined };
      case "gacha":
        return { type: "gacha" };
      case "roll":
        return {
          type: "roll",
          pulls: word === "十连" ? 10 : word === "单抽" ? 1 : parsePulls(arg),
        };
      case "search":
        return { type: "search", query: arg };
      case "refresh":
        return { type: "refresh" };
    }
  }
  return { type: "none" };
}
