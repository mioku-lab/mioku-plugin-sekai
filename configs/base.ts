export interface SekaiConfig {
  server: string;
  dataTtlHours: number;
  i18nTtlHours: number;
  preferCdn: boolean;
  proxyBase: string;
  preloadOnStart: boolean;
  defaultPulls: number;
  maxPulls: number;
  showTrained: boolean;
}

export const DEFAULT_CONFIG: SekaiConfig = {
  server: "jp",
  dataTtlHours: 12,
  i18nTtlHours: 168,
  preferCdn: true,
  proxyBase: "https://gh-proxy.com",
  preloadOnStart: true,
  defaultPulls: 10,
  maxPulls: 300,
  showTrained: true,
};

export function cloneConfig<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function numOrDefault(value: unknown, fallback: number, min = 0, max = Infinity): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

function boolOrDefault(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function proxyBaseOrDefault(value: unknown): string {
  const s = String(value ?? "").trim().replace(/\/+$/, "");
  if (!s) return "";
  return /^https?:\/\//.test(s) ? s : `https://${s}`;
}

export function normalizeSekaiConfig(config: any): SekaiConfig {
  const c = config || {};
  return {
    server: c.server === "jp" ? "jp" : DEFAULT_CONFIG.server,
    dataTtlHours: numOrDefault(c.dataTtlHours, DEFAULT_CONFIG.dataTtlHours, 1, 720),
    i18nTtlHours: numOrDefault(c.i18nTtlHours, DEFAULT_CONFIG.i18nTtlHours, 1, 2160),
    preferCdn: boolOrDefault(c.preferCdn, DEFAULT_CONFIG.preferCdn),
    proxyBase: proxyBaseOrDefault(c.proxyBase ?? DEFAULT_CONFIG.proxyBase),
    preloadOnStart: boolOrDefault(c.preloadOnStart, DEFAULT_CONFIG.preloadOnStart),
    defaultPulls: numOrDefault(c.defaultPulls, DEFAULT_CONFIG.defaultPulls, 1, 300),
    maxPulls: numOrDefault(c.maxPulls, DEFAULT_CONFIG.maxPulls, 1, 300),
    showTrained: boolOrDefault(c.showTrained, DEFAULT_CONFIG.showTrained),
  };
}
