import { definePlugin, type MiokiContext } from "mioki";
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
  handleGachaInfo,
  handleMusic,
} from "./handlers/query";
import type { HandlerContext } from "./handlers/types";
import { parseSekaiCommand } from "./router";
import { createSekaiSkill } from "./skills";
import { replyError, replyText } from "./utils";

const PLUGIN_NAME = "sekai";

const sekaiPlugin = definePlugin({
  name: PLUGIN_NAME,
  version: "0.1.0",
  description: "初音未来·世界计划辅助：角色/卡牌/乐曲/活动/卡池查询与模拟抽卡",

  async setup(ctx: MiokiContext) {
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

    ctx.handle("message", async (event: any) => {
      const text = ctx.text(event);
      if (!text) return;
      const cmd = parseSekaiCommand(text);
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
            return await handleCharactersList(h);
          case "character":
            return await handleCharacter(h, cmd.query);
          case "card":
            return await handleCard(h, cmd.query);
          case "music":
            return await handleMusic(h, cmd.query);
          case "event":
            return await handleEvent(h, cmd.count);
          case "gacha":
            return await handleGachaInfo(h);
          case "roll":
            return await handleRoll(h, cmd.pulls);
          case "refresh": {
            store.refresh();
            ctx.logger.info("sekai: 数据缓存已手动刷新");
            await replyText(
              ctx,
              event,
              "数据缓存已清除，下次查询时将重新拉取（大文件可能需要一点时间）",
            );
            return "已刷新 sekai 数据缓存";
          }
        }
      } catch (error) {
        ctx.logger.error(`sekai 命令 ${cmd.type} 执行失败: ${error}`);
        await replyError(ctx, event, `世界计划查询出错了：${String(error)}`);
        return `sekai 命令 ${cmd.type} 执行失败: ${String(error)}`;
      }
    });

    ctx.logger.info("sekai 插件初始化完成");

    return () => {
      if (aiService) aiService.removeSkill("sekai");
      ctx.logger.info("sekai 插件已卸载");
    };
  },
});

export default sekaiPlugin;
