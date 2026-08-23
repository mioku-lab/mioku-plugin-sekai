import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const UI_DIR = fileURLToPath(new URL("../ui/", import.meta.url));
const cache = new Map<string, string>();

export function loadUi(file: string): string {
  if (!cache.has(file)) cache.set(file, readFileSync(`${UI_DIR}${file}`, "utf8"));
  return cache.get(file)!;
}

export function fillTemplate(template: string, vars: Record<string, string>): string {
  let out = template;
  for (const [key, value] of Object.entries(vars)) {
    out = out.split(`{{${key}}}`).join(value);
  }
  return out;
}