import { unlinkSync } from "node:fs";
import {
  compactFresh,
  createCachedFetcher,
  readCompactFile,
  writeCompactFile,
  type CachedFetcher,
} from "./fetch";
import {
  buildCards,
  buildCharacters,
  buildEvents,
  buildGachas,
  buildMusics,
  buildProfiles,
  buildUnitMap,
} from "./build";
import { i18nUrl, masterUrl, type MasterFileKey } from "./sources";
import type {
  ArtistInfo,
  CharacterProfile,
  CompactCard,
  CompactCharacter,
  CompactEvent,
  CompactGacha,
  CompactMusic,
} from "../types";

export interface SekaiStoreOptions {
  dataDir: string;
  preferCdn: boolean;
  dataTtlMs: number;
  i18nTtlMs: number;
}

const COMPACT_SCHEMA_VERSION = 2;

export class SekaiStore {
  private fetcher: CachedFetcher;
  private cacheDir: string;
  private opts: SekaiStoreOptions;

  private charactersP?: Promise<CompactCharacter[]>;
  private cardsP?: Promise<CompactCard[]>;
  private cardByIdP?: Promise<Map<number, CompactCard>>;
  private musicsP?: Promise<CompactMusic[]>;
  private eventsP?: Promise<CompactEvent[]>;
  private gachasP?: Promise<CompactGacha[]>;
  private profilesP?: Promise<CharacterProfile[]>;
  private unitsP?: Promise<Record<string, { unitName?: string; colorCode?: string }>>;
  private artistsP?: Promise<ArtistInfo[]>;

  constructor(opts: SekaiStoreOptions) {
    this.opts = opts;
    this.fetcher = createCachedFetcher(opts.dataDir);
    this.cacheDir = this.fetcher.cacheDir;
  }

  getCharacters(): Promise<CompactCharacter[]> {
    this.charactersP ??= this.loadCharacters();
    return this.charactersP;
  }

  getCards(): Promise<CompactCard[]> {
    this.cardsP ??= this.loadCards();
    return this.cardsP;
  }

  async getCardById(id: number): Promise<CompactCard | undefined> {
    const map = await this.getCardMap();
    return map.get(id);
  }

  getMusics(): Promise<CompactMusic[]> {
    this.musicsP ??= this.loadMusics();
    return this.musicsP;
  }

  getEvents(): Promise<CompactEvent[]> {
    this.eventsP ??= this.loadEvents();
    return this.eventsP;
  }

  getGachas(): Promise<CompactGacha[]> {
    this.gachasP ??= this.loadGachas();
    return this.gachasP;
  }

  getProfiles(): Promise<CharacterProfile[]> {
    this.profilesP ??= this.loadProfiles();
    return this.profilesP;
  }

  getUnits(): Promise<Record<string, { unitName?: string; colorCode?: string }>> {
    this.unitsP ??= this.loadUnits();
    return this.unitsP;
  }

  getArtists(): Promise<ArtistInfo[]> {
    this.artistsP ??= this.loadArtists();
    return this.artistsP;
  }

  refresh(): void {
    this.charactersP = undefined;
    this.cardsP = undefined;
    this.cardByIdP = undefined;
    this.musicsP = undefined;
    this.eventsP = undefined;
    this.gachasP = undefined;
    this.profilesP = undefined;
    this.unitsP = undefined;
    this.artistsP = undefined;
    for (const name of COMPACT_NAMES) {
      try {
        unlinkSync(`${this.cacheDir}/${name}.json`);
      } catch {
      }
    }
  }

  private fetchMaster(key: MasterFileKey): Promise<any> {
    return this.fetcher.fetchJson(masterUrl(key, this.opts.preferCdn));
  }

  private fetchI18n(key: "character_name" | "card_prefix" | "music_titles" | "event_name") {
    return this.fetcher.fetchJson(i18nUrl(key), {
      ttlMs: this.opts.i18nTtlMs,
      disk: true,
      key: `i18n-${key}`,
    });
  }

  private async loadCharacters(): Promise<CompactCharacter[]> {
    const cached = this.readCompact("characters.min");
    if (cached) return cached;
    const [raw, zh, units, icons] = await Promise.all([
      this.fetchMaster("characters"),
      this.fetchI18n("character_name"),
      this.fetchMaster("unitProfiles"),
      this.fetchMaster("characterIcons"),
    ]);
    const built = buildCharacters(raw, zh ?? {}, units, icons ?? []);
    this.writeCompact("characters.min", built);
    return built;
  }

  private async loadCards(): Promise<CompactCard[]> {
    const cached = this.readCompact("cards.min");
    if (cached) return cached;
    const [raw, zh, rarities] = await Promise.all([
      this.fetchMaster("cards"),
      this.fetchI18n("card_prefix"),
      this.fetchMaster("cardRarities"),
    ]);
    const built = buildCards(raw, zh ?? {}, rarities);
    this.writeCompact("cards.min", built);
    return built;
  }

  private async loadMusics(): Promise<CompactMusic[]> {
    const cached = this.readCompact("musics.min");
    if (cached) return cached;
    const [raw, diffs, vocals, artists, zh, chars] = await Promise.all([
      this.fetchMaster("musics"),
      this.fetchMaster("musicDifficulties"),
      this.fetchMaster("musicVocals"),
      this.fetchMaster("musicArtists"),
      this.fetchI18n("music_titles"),
      this.getCharacters(),
    ]);
    const charNames = new Map<number, string>();
    for (const c of chars) {
      charNames.set(c.id, c.nameZh ?? `${c.firstName}${c.givenName}`);
    }
    const built = buildMusics(raw, diffs, vocals, artists, zh ?? {}, charNames);
    this.writeCompact("musics.min", built);
    return built;
  }

  private async loadArtists(): Promise<ArtistInfo[]> {
    const musics = await this.getMusics();
    const counts = new Map<string, number>();
    for (const m of musics) {
      if (!m.artist) continue;
      counts.set(m.artist, (counts.get(m.artist) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, musicCount]) => ({ name, musicCount }))
      .sort((a, b) => b.musicCount - a.musicCount || a.name.localeCompare(b.name));
  }

  private async loadEvents(): Promise<CompactEvent[]> {
    const cached = this.readCompact("events.min");
    if (cached) return cached;
    const [raw, zh] = await Promise.all([
      this.fetchMaster("events"),
      this.fetchI18n("event_name"),
    ]);
    const built = buildEvents(raw, zh ?? {});
    this.writeCompact("events.min", built);
    return built;
  }

  private async loadGachas(): Promise<CompactGacha[]> {
    const cached = this.readCompact("gachas.min");
    if (cached) return cached;
    const raw = await this.fetchMaster("gachas");
    const built = buildGachas(raw);
    this.writeCompact("gachas.min", built);
    return built;
  }

  private async loadProfiles(): Promise<CharacterProfile[]> {
    const cached = this.readCompact("profiles.min");
    if (cached) return cached;
    const raw = await this.fetchMaster("characterProfiles");
    const built = buildProfiles(raw);
    this.writeCompact("profiles.min", built);
    return built;
  }

  private async loadUnits(): Promise<Record<string, { unitName?: string; colorCode?: string }>> {
    const cached = this.readCompact("units.min");
    if (cached) return cached;
    const raw = await this.fetchMaster("unitProfiles");
    const built = buildUnitMap(raw);
    this.writeCompact("units.min", built);
    return built;
  }

  private async getCardMap(): Promise<Map<number, CompactCard>> {
    this.cardByIdP ??= this.getCards().then(
      (cards) => new Map(cards.map((c) => [c.id, c])),
    );
    return this.cardByIdP;
  }

  private readCompact(name: string): any | undefined {
    if (!compactFresh(this.cacheDir, name, this.opts.dataTtlMs)) return undefined;
    const raw = readCompactFile(this.cacheDir, name);
    if (
      raw &&
      typeof raw === "object" &&
      !Array.isArray(raw) &&
      (raw as { __schema?: unknown }).__schema === COMPACT_SCHEMA_VERSION
    ) {
      return (raw as { data: unknown }).data;
    }
    return undefined;
  }

  private writeCompact(name: string, data: any): void {
    writeCompactFile(this.cacheDir, name, { __schema: COMPACT_SCHEMA_VERSION, data });
  }
}

const COMPACT_NAMES = [
  "characters.min",
  "cards.min",
  "musics.min",
  "events.min",
  "gachas.min",
  "profiles.min",
  "units.min",
];
