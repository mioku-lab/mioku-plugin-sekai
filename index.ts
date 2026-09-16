import { definePlugin, type CommandDefinition, type MessageEvent, type MiokuContext } from "mioku";
import { ensureDataDir, getService, Services } from "mioku";
import {
  cloneConfig,
  DEFAULT_CONFIG,
  normalizeSekaiConfig,
  type SekaiConfig,
} from "./configs/base";
import { SekaiStore } from "./data/store";
import { handleRoll } from "./handlers/gacha";
import {
  handleCard,
  handleCharacter,
  handleCharactersList,
  handleEvent,
  handleEventList,
  handleGachaInfo,
  handleMusic,
} from "./handlers/query";
import { handleSearch } from "./handlers/search";
import type { HandlerContext } from "./handlers/types";
import { parseSekaiCommand } from "./router";
import { createSekaiSkill } from "./skills";
import { replyError, replyText } from "./utils";

const PLUGIN_NAME = "sekai";
const PREFIX = /^(?:pjsk|pj|sekai|世界计划)/i;

const sekaiPlugin = definePlugin({
  name: PLUGIN_NAME,

  async setup(ctx: MiokuContext) {
    ctx.logger.info("sekai 插件正在初始化...");

    const dataDir = ensureDataDir(PLUGIN_NAME);

    let config: SekaiConfig = cloneConfig(DEFAULT_CONFIG);
    const configService = getService(ctx, Services.Config);
    if (configService) {
      await configService.registerConfig(PLUGIN_NAME, "base", config);
      const persisted = await configService.getConfig(PLUGIN_NAME, "base");
      if (persisted) {
        config = normalizeSekaiConfig(persisted);
      }
      configService.onConfigChange(PLUGIN_NAME, "base", (next) => {
        config = normalizeSekaiConfig(next);
      });
    } else {
      ctx.logger.warn("config 服务未加载，sekai 插件将使用默认配置");
    }

    const store = new SekaiStore({
      dataDir,
      preferCdn: config.preferCdn,
      proxyBase: config.proxyBase,
      dataTtlMs: config.dataTtlHours * 3600_000,
      i18nTtlMs: config.i18nTtlHours * 3600_000,
    });

    const screenshot = getService(ctx, Services.Screenshot);
    if (!screenshot) {
      ctx.logger.warn("sekai: screenshot 服务未启用，图片渲染功能不可用");
    }

    const aiService = getService(ctx, Services.AI);
    if (aiService) {
      aiService.registerSkill(createSekaiSkill(store, () => config.maxPulls));
      ctx.logger.info("sekai: AI 技能 sekai 已注册");
    } else {
      ctx.logger.warn("sekai: ai 服务未加载，AI 查询工具不可用");
    }

    const dispatch = async (event: MessageEvent, body: string) => {
      const cmd = parseSekaiCommand(body);
      if (cmd.type === "none") return;
      const h: HandlerContext = {
        ctx,
        event,
        store,
        screenshot,
        getConfig: () => config,
      };
      try {
        switch (cmd.type) {
          case "characters":
            await handleCharactersList(h);
            break;
          case "character":
            await handleCharacter(h, cmd.query);
            break;
          case "card":
            await handleCard(h, cmd.query);
            break;
          case "music":
            await handleMusic(h, cmd.query);
            break;
          case "event":
            await handleEvent(h, cmd.id);
            break;
          case "eventList":
            await handleEventList(h, cmd.count);
            break;
          case "gacha":
            await handleGachaInfo(h);
            break;
          case "roll":
            await handleRoll(h, cmd.pulls);
            break;
          case "search":
            await handleSearch(h, cmd.query);
            break;
          case "refresh": {
            store.refresh();
            ctx.logger.info("sekai: 数据缓存已手动刷新");
            await replyText(
              ctx,
              event,
              "数据缓存已清除，下次查询时将重新拉取（大文件可能需要一点时间）",
            );
            break;
          }
        }
      } catch (error) {
        ctx.logger.error(`sekai 命令 ${cmd.type} 执行失败: ${error}`);
        await replyError(ctx, event, `世界计划查询出错了：${String(error)}`);
      }
    };

    const cmd = (command: CommandDefinition) =>
      ctx.command({ ...command, prefixes: false });

    cmd({
      name: "pj角色列表",
      match: new RegExp(`${PREFIX.source}\\s*(?:角色列表|characters)(?:\\s|$)`, "i"),
      description: "查看全部角色一览",
      usage: "pj角色列表",
      handler: ({ event, body }) => dispatch(event, body),
    });
    cmd({
      name: "pj角色",
      match: new RegExp(`${PREFIX.source}\\s*(?:角色|character|chara)(?:\\s|$)`, "i"),
      description: "查询角色详情（生日/身高/学校/爱好/CV/组合等）",
      usage: "pj角色 一歌 / pj角色 miku",
      handler: ({ event, body }) => dispatch(event, body),
    });
    cmd({
      name: "pj卡",
      match: new RegExp(`${PREFIX.source}\\s*(?:卡牌|卡|card)(?:\\s|$)`, "i"),
      description: "查询卡牌（稀有度/属性/技能/卡面/实装时间），支持名称或卡号",
      usage: "pj卡 心愿 / pj卡 88",
      handler: ({ event, body }) => dispatch(event, body),
    });
    cmd({
      name: "pj曲",
      match: new RegExp(`${PREFIX.source}\\s*(?:曲谱|歌曲|曲|music|song)(?:\\s|$)`, "i"),
      description: "查询乐曲信息与全部难度谱面",
      usage: "pj曲 ロキ / pj曲 Tell Your World",
      handler: ({ event, body }) => dispatch(event, body),
    });
    cmd({
      name: "pj活动列表",
      match: new RegExp(`${PREFIX.source}\\s*(?:活动列表|eventlist)(?:\\s|$)`, "i"),
      description: "查看最近活动列表",
      usage: "pj活动列表",
      handler: ({ event, body }) => dispatch(event, body),
    });
    cmd({
      name: "pj活动",
      match: new RegExp(`${PREFIX.source}\\s*(?:活动|event)(?:\\s|$)`, "i"),
      description: "查询当前进行中的活动，加数字查看最近 N 个",
      usage: "pj活动 / pj活动 3",
      handler: ({ event, body }) => dispatch(event, body),
    });
    cmd({
      name: "pj卡池",
      match: new RegExp(`${PREFIX.source}\\s*(?:卡池|池|gacha)(?:\\s|$)`, "i"),
      description: "查询当前卡池（概率/UP 卡池/时间）",
      usage: "pj卡池",
      handler: ({ event, body }) => dispatch(event, body),
    });
    cmd({
      name: "pj抽卡",
      match: new RegExp(`${PREFIX.source}\\s*(?:抽卡|扭蛋|十连|单抽|roll)(?:\\s|$)`, "i"),
      description: "模拟抽卡：真实卡池与概率，十连含保底",
      usage: "pj抽卡 / pj十连 / pj单抽 / pj抽卡 50",
      handler: ({ event, body }) => dispatch(event, body),
    });
    cmd({
      name: "pj搜索",
      match: new RegExp(`${PREFIX.source}\\s*(?:搜索|search)(?:\\s|$)`, "i"),
      description: "跨数据模糊搜索（角色/卡/曲/活动/卡池）",
      usage: "pj搜索 心愿 / pj搜索 miku",
      handler: ({ event, body }) => dispatch(event, body),
    });
    cmd({
      name: "pj数据更新",
      match: new RegExp(`${PREFIX.source}\\s*(?:数据更新|刷新|refresh|update)(?:\\s|$)`, "i"),
      description: "强制刷新插件数据缓存",
      usage: "pj数据更新",
      permission: "admin",
      handler: ({ event, body }) => dispatch(event, body),
    });

    ctx.logger.info("sekai 插件初始化完成");

    if (config.preloadOnStart) {
      queueMicrotask(() => {
        void Promise.allSettled([
          store.getCharacters(),
          store.getUnits(),
          store.getMusics(),
          store.getCards(),
          store.getGachas(),
          store.getEvents(),
          store.getProfiles(),
        ]).then((results) => {
          const failed = results.filter((r) => r.status === "rejected").length;
          if (failed) ctx.logger.warn(`sekai 数据预加载完成，${failed} 项失败`);
          else ctx.logger.info("sekai 数据预加载完成");
        });
      });
    }

    return () => {
      if (aiService) aiService.removeSkill("sekai");
      ctx.logger.info("sekai 插件已卸载");
    };
  },
});

export default sekaiPlugin;
