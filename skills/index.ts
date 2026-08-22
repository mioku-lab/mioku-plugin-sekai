import type { AISkill } from "mioku";
import type { SekaiStore } from "../data/store";
import { infoTool } from "./query";
import { searchTool } from "./search";
import { simulateGachaTool } from "./gacha";

export function createSekaiSkill(
  store: SekaiStore,
  getMaxPulls: () => number,
): AISkill {
  return {
    name: "sekai",
    description:
      "《世界计划》（Project Sekai / PJSK）游戏数据查询：角色、卡牌、乐曲、活动、卡池信息，以及模拟抽卡。当用户询问初音未来世界计划相关内容时使用。",
    permission: "member",
    tools: [
      infoTool(store),
      searchTool(store),
      simulateGachaTool(store, getMaxPulls),
    ],
  };
}