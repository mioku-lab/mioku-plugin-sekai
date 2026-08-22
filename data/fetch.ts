import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export interface FetchOptions {
  ttlMs?: number;
  disk?: boolean;
  key?: string;
}

function sanitizeKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9_-]/g, "_");
}

export interface CachedFetcher {
  fetchJson(url: string, opts?: FetchOptions): Promise<any>;
  cacheDir: string;
}

export function createCachedFetcher(dataDir: string): CachedFetcher {
  const cacheDir = join(dataDir, "cache");
  const mem = new Map<string, { at: number; data: any }>();

  async function fetchJson(url: string, opts: FetchOptions = {}): Promise<any> {
    const { ttlMs = 0, disk = false, key = url } = opts;
    const now = Date.now();

    if (ttlMs > 0) {
      const hit = mem.get(key);
      if (hit && now - hit.at < ttlMs) return hit.data;
    }

    const file = disk ? join(cacheDir, `${sanitizeKey(key)}.json`) : "";
    if (disk && ttlMs > 0 && existsSync(file)) {
      const stat = statSync(file);
      if (now - stat.mtimeMs < ttlMs) {
        try {
          const data = JSON.parse(readFileSync(file, "utf8"));
          mem.set(key, { at: now, data });
          return data;
        } catch {
        }
      }
    }

    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) {
      throw new Error(`GET ${url} 失败: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();

    if (ttlMs > 0) mem.set(key, { at: now, data });
    if (disk) {
      mkdirSync(cacheDir, { recursive: true });
      writeFileSync(file, JSON.stringify(data));
    }
    return data;
  }

  return { fetchJson, cacheDir };
}

export function readCompactFile(cacheDir: string, name: string): any | undefined {
  const file = join(cacheDir, `${name}.json`);
  if (!existsSync(file)) return undefined;
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return undefined;
  }
}

export function writeCompactFile(cacheDir: string, name: string, data: any): void {
  mkdirSync(cacheDir, { recursive: true });
  writeFileSync(join(cacheDir, `${name}.json`), JSON.stringify(data));
}

export function compactFresh(cacheDir: string, name: string, ttlMs: number): boolean {
  const file = join(cacheDir, `${name}.json`);
  if (!existsSync(file)) return false;
  return Date.now() - statSync(file).mtimeMs < ttlMs;
}
