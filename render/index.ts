import type { ScreenshotService } from "mioku";

export async function renderToImage(
  screenshot: ScreenshotService,
  html: string,
  width = 900,
): Promise<string> {
  const ratio = Number(/data-height-ratio="([\d.]+)"/.exec(html)?.[1]);
  const height = Number.isFinite(ratio) && ratio > 0 ? Math.round(width * ratio) : undefined;
  return screenshot.screenshot(html, { width, height, fullPage: true, type: "png" });
}
