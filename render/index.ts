import type { ScreenshotService } from "mioku";

export async function renderToImage(
  screenshot: ScreenshotService,
  html: string,
  width = 1600,
): Promise<string> {
  const preferredWidth = Number(/data-render-width="([\d.]+)"/.exec(html)?.[1]);
  const ratio = Number(/data-height-ratio="([\d.]+)"/.exec(html)?.[1]);
  const renderWidth = Number.isFinite(preferredWidth) && preferredWidth > 0 ? preferredWidth : width;
  const height = Number.isFinite(ratio) && ratio > 0 ? Math.round(renderWidth * ratio) : undefined;
  return screenshot.screenshot(html, {
    width: renderWidth,
    height,
    deviceScaleFactor: 1,
    fullPage: true,
    type: "png",
  });
}
