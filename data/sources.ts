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
  | "characterIcons";

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
};

export type I18nFileKey =
  | "character_name"
  | "card_prefix"
  | "music_titles"
  | "event_name"
  | "skill_desc";

export const I18N_FILES: Record<I18nFileKey, string> = {
  character_name: "character_name.json",
  card_prefix: "card_prefix.json",
  music_titles: "music_titles.json",
  event_name: "event_name.json",
  skill_desc: "skill_desc.json",
};

const RAW_BASE =
  "https://raw.githubusercontent.com/Team-Haruki/haruki-sekai-master/main";
const CDN_BASE = "https://cdn.jsdelivr.net/gh/Team-Haruki/haruki-sekai-master@main";
const I18N_BASE =
  "https://raw.githubusercontent.com/Sekai-World/sekai-i18n/master/zh-CN";

export const ASSET_BASE = "https://storage.sekai.best/sekai-jp-assets";

export function masterUrl(key: MasterFileKey, preferCdn: boolean): string {
  const spec = MASTER_FILES[key];
  if (!spec) throw new Error(`unknown master file: ${key}`);
  if (preferCdn && !spec.big) return `${CDN_BASE}/${spec.path}`;
  return `${RAW_BASE}/${spec.path}`;
}

export function i18nUrl(key: I18nFileKey): string {
  return `${I18N_BASE}/${I18N_FILES[key]}`;
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
