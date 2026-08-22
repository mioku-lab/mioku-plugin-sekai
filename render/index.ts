import type { ScreenshotService } from "mioku";

export async function renderToImage(
  screenshot: ScreenshotService,
  html: string,
  width = 900,
): Promise<string> {
  return screenshot.screenshot(html, { width, fullPage: true, type: "png" });
}
