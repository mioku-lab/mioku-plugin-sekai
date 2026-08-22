export type MasterFileKey =
  | "characters"
  | "cards"
  | "musics"
  | "musicDifficulties"
  | "musicVocals"
  | "musicArtists"
  | "events"
  | "gachas"
  | "unitProfiles"
  | "characterProfiles"
  | "cardRarities"
  | "characterIcons"
  | "materials";

export interface MasterFileSpec {
  path: string;
  big?: boolean;
}

export const MASTER_FILES: Record<MasterFileKey, MasterFileSpec> = {
  characters: { path: "master/gameCharacters.json" },
  cards: { path: "master/cards.json", big: true },
  musics: { path: "master/musics.json" },
  musicDifficulties: { path: "master/musicDifficulties.json" },
  musicVocals: { path: "master/musicVocals.json" },
  musicArtists: { path: "master/musicArtists.json" },
  events: { path: "master/events.json" },
  gachas: { path: "master/gachas.json", big: true },
  unitProfiles: { path: "master/unitProfiles.json" },
  characterProfiles: { path: "master/characterProfiles.json" },
  cardRarities: { path: "master/cardRarities.json" },
  characterIcons: { path: "master/customProfileCharacterIconResources.json" },
  materials: { path: "master/materials.json" },
};

export type I18nFileKey =
  | "character_name"
  | "character_profile"
  | "card_prefix"
  | "card_skill_name"
  | "card_gacha_phrase"
  | "music_titles"
  | "event_name"
  | "unit_profile"
  | "skill_desc";

export const I18N_FILES: Record<I18nFileKey, string> = {
  character_name: "character_name.json",
  character_profile: "character_profile.json",
  card_prefix: "card_prefix.json",
  card_skill_name: "card_skill_name.json",
  card_gacha_phrase: "card_gacha_phrase.json",
  music_titles: "music_titles.json",
  event_name: "event_name.json",
  unit_profile: "unit_profile.json",
  skill_desc: "skill_desc.json",
};

const RAW_BASE =
  "https://raw.githubusercontent.com/Team-Haruki/haruki-sekai-master/main";
const CDN_BASE = "https://cdn.jsdelivr.net/gh/Team-Haruki/haruki-sekai-master@main";
const I18N_BASE =
  "https://raw.githubusercontent.com/Sekai-World/sekai-i18n/master/zh-CN";
const I18N_CDN_BASE = "https://cdn.jsdelivr.net/gh/Sekai-World/sekai-i18n@master/zh-CN";

export const ASSET_BASE = "https://storage.sekai.best/sekai-jp-assets";

export function proxyUrl(proxyBase: string, rawUrl: string): string {
  return `${proxyBase}/${rawUrl}`;
}

// jsDelivr 单文件上限 20MB，超过的文件只能走 raw.github
export function masterUrlCandidates(
  key: MasterFileKey,
  preferCdn: boolean,
  proxyBase: string,
): string[] {
  const spec = MASTER_FILES[key];
  if (!spec) throw new Error(`unknown master file: ${key}`);
  const raw = `${RAW_BASE}/${spec.path}`;
  if (spec.big) return proxyBase ? [proxyUrl(proxyBase, raw), raw] : [raw];
  const cdn = `${CDN_BASE}/${spec.path}`;
  const direct = preferCdn ? [cdn, raw] : [raw, cdn];
  return proxyBase ? [proxyUrl(proxyBase, raw), ...direct] : direct;
}

export function i18nUrlCandidates(key: I18nFileKey, proxyBase: string): string[] {
  const file = I18N_FILES[key];
  const raw = `${I18N_BASE}/${file}`;
  const direct = [raw, `${I18N_CDN_BASE}/${file}`];
  return proxyBase ? [proxyUrl(proxyBase, raw), ...direct] : direct;
}

export function cardImageUrl(assetbundleName: string, trained = false): string {
  return `${ASSET_BASE}/character/member/${assetbundleName}/card_${
    trained ? "after_training" : "normal"
  }.webp`;
}

export function jacketUrl(assetbundleName: string): string {
  return `${ASSET_BASE}/music/jacket/${assetbundleName}/${assetbundleName}.webp`;
}

export function characterIconUrl(fileName: string): string {
  return `${ASSET_BASE}/custom_profile/character_icon/${fileName}.webp`;
}

export function eventImageUrl(assetbundleName: string): string {
  return `${ASSET_BASE}/event/${assetbundleName}/screen/bg.webp`;
}

export function gachaBannerUrl(gachaId: number): string {
  return `${ASSET_BASE}/home/banner/banner_gacha${gachaId}/banner_gacha${gachaId}.webp`;
}

export function gachaLogoUrl(assetbundleName: string): string {
  return `${ASSET_BASE}/gacha/${assetbundleName}/logo/logo.webp`;
}
