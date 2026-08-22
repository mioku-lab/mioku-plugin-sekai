import type { ScreenshotService } from "mioku";
import type { SekaiStore } from "../data/store";
import type { SekaiConfig } from "../configs/base";

export interface HandlerContext {
  ctx: any;
  event: any;
  store: SekaiStore;
  screenshot?: ScreenshotService;
  getConfig: () => SekaiConfig;
}
