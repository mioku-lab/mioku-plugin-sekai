import { readFileSync } from "node:fs";
import type { AIService } from "mioku";

export async function replyText(ctx: any, event: any, text: string): Promise<void> {
  await event.reply([ctx.segment.text(text)], false);
}

function buildImageParts(ctx: any, image: string | Buffer, text?: string): any[] {
  const parts = [ctx.segment.image(image)];
  if (text) parts.push(ctx.segment.text(text));
  return parts;
}

export async function replyImage(
  ctx: any,
  event: any,
  imagePath: string,
  text?: string,
): Promise<void> {
  try {
    await event.reply(buildImageParts(ctx, imagePath, text), false);
  } catch (pathErr) {
    ctx.logger?.warn?.(`sekai 图片按路径发送失败，转为 base64 发送: ${String(pathErr)}`);
    let buffer: Buffer;
    try {
      buffer = readFileSync(imagePath);
    } catch {
      throw pathErr;
    }
    await event.reply(buildImageParts(ctx, buffer, text), false);
  }
}

export async function replyError(ctx: any, event: any, message: string): Promise<void> {
  const ai = ctx?.services?.ai as AIService | undefined;
  const chatRuntime = ai?.getChatRuntime?.();
  if (chatRuntime) {
    try {
      await chatRuntime.generateNotice({
        event,
        instruction: `告诉用户：${message}`,
        send: true,
      });
      return;
    } catch (e) {
      ctx.logger?.warn?.(`sekai generateNotice 失败: ${String(e)}`);
    }
  }
  await event.reply([ctx.segment.text(message)], false);
}
