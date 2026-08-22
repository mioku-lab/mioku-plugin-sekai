import type { HandlerContext } from "./types";
import { replyText } from "../utils";

const HELP_TEXT = `世界计划（Project Sekai）辅助插件
━━━━━━━━━━━━━━━━
【查询】
pj角色列表 —— 全部角色一览
pj角色 <名称/id> —— 角色详情（生日/身高/CV 等）
pj卡 <卡名/卡号> —— 卡牌查询（稀有度/属性/技能/卡面）
pj曲 <曲名> —— 乐曲与全部难度谱面
pj活动 [数字] —— 当前活动；加数字看最近 N 期
pj卡池 —— 当前卡池（概率/UP 卡池）
【娱乐】
pj抽卡 [次数] —— 模拟抽卡（真实卡池与概率，十连含保底）
pj十连 / pj单抽 —— 快捷抽卡
【维护】
pj数据更新 —— 刷新数据缓存（管理员）
━━━━━━━━━━━━━━━━
前缀也支持 pjsk / sekai / 世界计划；数据来自日服 master 数据源`;

export async function handleHelp(h: HandlerContext): Promise<void> {
  await replyText(h.ctx, h.event, HELP_TEXT);
}
