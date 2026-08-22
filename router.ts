export type SekaiCommand =
  | { type: "help" }
  | { type: "characters" }
  | { type: "character"; query: string }
  | { type: "card"; query: string }
  | { type: "music"; query: string }
  | { type: "event"; count?: number }
  | { type: "gacha" }
  | { type: "roll"; pulls: number }
  | { type: "refresh" }
  | { type: "none" };

const PREFIX = /^(?:pjsk|pj|sekai|世界计划)\s*/i;

function parsePulls(arg: string): number {
  const q = arg.trim();
  if (q === "十连" || q === "10连") return 10;
  if (q === "单抽") return 1;
  if (/^\d+$/.test(q)) return Number(q);
  return 0;
}

export function parseSekaiCommand(text: string): SekaiCommand {
  const trimmed = text.trim();
  const m = trimmed.match(PREFIX);
  if (!m) return { type: "none" };
  const rest = trimmed.slice(m[0].length).trim();
  if (!rest || /^(帮助|help|ヘルプ)$/i.test(rest)) return { type: "help" };

  const tokens = rest.split(/\s+/);
  const head = tokens[0].toLowerCase();
  const arg = tokens.slice(1).join(" ").trim();

  switch (head) {
    case "帮助":
    case "help":
    case "ヘルプ":
      return { type: "help" };
    case "角色列表":
    case "characters":
      return { type: "characters" };
    case "角色":
    case "character":
    case "chara":
      return { type: "character", query: arg };
    case "卡":
    case "卡牌":
    case "card":
      return { type: "card", query: arg };
    case "曲":
    case "歌曲":
    case "曲谱":
    case "music":
    case "song":
      return { type: "music", query: arg };
    case "活动":
    case "event":
      return {
        type: "event",
        count: /^\d+$/.test(arg) ? Number(arg) : undefined,
      };
    case "卡池":
    case "gacha":
    case "池":
      return { type: "gacha" };
    case "抽卡":
    case "扭蛋":
    case "roll":
      return { type: "roll", pulls: parsePulls(arg) };
    case "十连":
      return { type: "roll", pulls: 10 };
    case "单抽":
      return { type: "roll", pulls: 1 };
    case "数据更新":
    case "刷新":
    case "refresh":
    case "update":
      return { type: "refresh" };
    default:
      return { type: "none" };
  }
}
