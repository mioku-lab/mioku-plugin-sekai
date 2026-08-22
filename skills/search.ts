import type { AITool } from "mioku";
import type { SekaiStore } from "../data/store";
import { searchSekaiData } from "../handlers/search";

export function searchTool(store: SekaiStore): AITool {
  return {
    name: "search",
    description:
      "在《世界计划》全数据中模糊搜索（角色/卡牌/乐曲/艺人/活动/卡池）。支持中日英文、罗马字、跨脚本子序列匹配，结果不发给用户。当用户提到一个不确定的pjsk的内容需要查询的时候配合info使用",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "搜索关键词：名字（中/日/罗马字/英文皆可）、id、卡名片段、曲名片段、活动名、卡池名等",
        },
      },
      required: ["query"],
    },
    handler: async (args: { query?: string }) => {
      const query = String(args?.query ?? "").trim();
      if (!query) return "请提供搜索关键词";
      const result = await searchSekaiData(store, query);
      if (!result) return `没有找到与「${query}」相关的内容`;
      return result.text;
    },
  } as AITool;
}
