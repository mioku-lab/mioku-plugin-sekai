import type {
  CardAttr,
  CardRarity,
  CharacterProfile,
  CompactCard,
  CompactCharacter,
  CompactEvent,
  CompactGacha,
  CompactMusic,
  GachaPoolEntry,
  GachaRate,
  MusicDifficulty,
} from "../types";

interface RawCharacter {
  id: number;
  seq: number;
  firstName: string;
  givenName: string;
  firstNameRuby: string;
  givenNameRuby: string;
  firstNameEnglish: string;
  givenNameEnglish: string;
  unit: string;
  supportUnitType: string;
  modelName?: string;
}

interface RawCharacterIcon {
  id: number;
  fileName: string;
}

interface RawUnitProfile {
  unit: string;
  unitName: string;
  colorCode?: string;
}

interface RawCardParameter {
  cardId: number;
  cardLevel: number;
  cardParameterType: string;
  power: number;
}

interface RawCard {
  id: number;
  seq: number;
  characterId: number;
  cardRarityType: CardRarity;
  attr: CardAttr;
  skillId: number;
  cardSkillName: string;
  prefix: string;
  assetbundleName: string;
  releaseAt: number;
  cardParameters: RawCardParameter[];
}

interface RawRarity {
  cardRarityType: CardRarity;
  maxLevel?: number;
  trainingMaxLevel?: number;
}

interface RawMusic {
  id: number;
  title: string;
  creatorArtistId?: number;
  lyricist?: string;
  composer?: string;
  arranger?: string;
  categories?: string[];
  assetbundleName: string;
  publishedAt?: number;
}

interface RawMusicDiff {
  musicId: number;
  musicDifficulty: MusicDifficulty;
  playLevel: number;
  totalNoteCount: number;
}

interface RawMusicVocal {
  musicId: number;
  caption?: string;
  characters?: Array<{ characterId?: number }>;
}

interface RawArtist {
  id: number;
  name: string;
}

interface RawEvent {
  id: number;
  eventType: string;
  name: string;
  startAt?: number;
  aggregateAt?: number;
  rankingAnnounceAt?: number;
  distributionEndAt?: number;
  unit?: string;
}

interface RawGachaDetail {
  cardId: number;
  weight: number;
  isWish?: boolean;
}

interface RawGachaRate {
  cardRarityType: CardRarity;
  lotteryType?: "normal" | "guarantee";
  rate: number;
}

interface RawGacha {
  id: number;
  gachaType: string;
  name: string;
  seq: number;
  startAt: number;
  endAt: number;
  isShowPeriod?: boolean;
  gachaCardRarityRates?: RawGachaRate[];
  gachaDetails?: RawGachaDetail[];
}

interface RawCharacterProfile {
  characterId: number;
  characterVoice?: string;
  birthday?: string;
  height?: string;
  school?: string;
  schoolYear?: string;
  hobby?: string;
  specialSkill?: string;
  favoriteFood?: string;
  hatedFood?: string;
  weak?: string;
  introduction?: string;
}

export function buildCharacters(
  raw: RawCharacter[],
  zhName: Record<string, { firstName?: string; givenName?: string }>,
  rawUnits: RawUnitProfile[],
  rawIcons: RawCharacterIcon[] = [],
): CompactCharacter[] {
  const units = new Map(rawUnits.map((u) => [u.unit, u]));
  const iconById = new Map(rawIcons.map((i) => [i.id, i.fileName]));
  return raw.map((c) => {
    const zh = zhName[String(c.id)];
    const unit = units.get(c.unit);
    return {
      id: c.id,
      seq: c.seq,
      firstName: c.firstName ?? "",
      givenName: c.givenName ?? "",
      firstNameRuby: c.firstNameRuby ?? "",
      givenNameRuby: c.givenNameRuby ?? "",
      firstNameEn: c.firstNameEnglish ?? "",
      givenNameEn: c.givenNameEnglish ?? "",
      unit: c.unit,
      supportUnitType: c.supportUnitType,
      modelName: c.modelName,
      iconFileName: iconById.get(c.id),
      nameZh: zh ? `${zh.firstName ?? ""}${zh.givenName ?? ""}` : undefined,
      unitName: unit?.unitName,
      colorCode: unit?.colorCode,
    };
  });
}

export function buildUnitMap(
  raw: RawUnitProfile[],
): Record<string, { unitName?: string; colorCode?: string }> {
  const out: Record<string, { unitName?: string; colorCode?: string }> = {};
  for (const u of raw) out[u.unit] = { unitName: u.unitName, colorCode: u.colorCode };
  return out;
}

const TRAINED_RARITIES: ReadonlySet<CardRarity> = new Set([
  "rarity_3",
  "rarity_4",
  "rarity_birthday",
]);

export function buildCards(
  raw: RawCard[],
  zhPrefix: Record<string, string>,
  rawRarities: RawRarity[],
): CompactCard[] {
  const levels = new Map(
    rawRarities.map((r) => [
      r.cardRarityType,
      { max: r.maxLevel ?? 0, trained: r.trainingMaxLevel ?? r.maxLevel ?? 0 },
    ]),
  );
  return raw.map((c) => {
    const lv = levels.get(c.cardRarityType);
    const max = lv?.max ?? 0;
    const trained = lv?.trained ?? max;
    const maxPower = sumPowerAt(c.cardParameters, max);
    const trainedPower = trained > max ? sumPowerAt(c.cardParameters, trained) : undefined;
    return {
      id: c.id,
      seq: c.seq,
      characterId: c.characterId,
      rarity: c.cardRarityType,
      attr: c.attr,
      assetbundleName: c.assetbundleName,
      prefix: c.prefix,
      prefixZh: zhPrefix[String(c.id)],
      cardSkillName: c.cardSkillName,
      skillId: c.skillId,
      releaseAt: c.releaseAt ?? 0,
      hasTrained: TRAINED_RARITIES.has(c.cardRarityType),
      maxPower,
      trainedPower,
    } as CompactCard;
  });
}

function sumPowerAt(params: RawCardParameter[], level: number): number | undefined {
  if (!level) return undefined;
  const at = params.filter((p) => p.cardLevel === level);
  if (!at.length) {
    const top = params.reduce<number>((acc, p) => Math.max(acc, p.cardLevel), 0);
    if (!top) return undefined;
    return sumPowerAt(params, top);
  }
  return at.reduce((s, p) => s + p.power, 0);
}

export function buildMusics(
  raw: RawMusic[],
  rawDiffs: RawMusicDiff[],
  rawVocals: RawMusicVocal[],
  rawArtists: RawArtist[],
  zhTitles: Record<string, string>,
  charNames: Map<number, string>,
): CompactMusic[] {
  const artists = new Map(rawArtists.map((a) => [a.id, a.name]));
  const diffsByMusic = new Map<number, CompactMusic["difficulties"]>();
  for (const d of rawDiffs) {
    const list = diffsByMusic.get(d.musicId) ?? [];
    list.push({
      difficulty: d.musicDifficulty,
      playLevel: d.playLevel,
      totalNoteCount: d.totalNoteCount,
    });
    diffsByMusic.set(d.musicId, list);
  }
  const vocalsByMusic = new Map<number, Set<string>>();
  for (const v of rawVocals) {
    const names = vocalsByMusic.get(v.musicId) ?? new Set<string>();
    for (const ch of v.characters ?? []) {
      if (ch.characterId == null) continue;
      const name = charNames.get(ch.characterId);
      if (name) names.add(name);
    }
    vocalsByMusic.set(v.musicId, names);
  }
  return raw.map((m) => ({
    id: m.id,
    title: m.title,
    titleZh: zhTitles[String(m.id)],
    artist: m.creatorArtistId != null ? artists.get(m.creatorArtistId) : undefined,
    lyricist: m.lyricist ?? "",
    composer: m.composer ?? "",
    arranger: m.arranger ?? "",
    categories: m.categories ?? [],
    assetbundleName: m.assetbundleName,
    publishedAt: m.publishedAt ?? 0,
    difficulties: (diffsByMusic.get(m.id) ?? []).sort(
      (a, b) => DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty],
    ),
    vocals: vocalsByMusic.get(m.id) ? [...(vocalsByMusic.get(m.id) as Set<string>)] : undefined,
  }));
}

const DIFF_ORDER: Record<MusicDifficulty, number> = {
  easy: 0,
  normal: 1,
  hard: 2,
  expert: 3,
  master: 4,
  append: 5,
};

export function buildEvents(
  raw: RawEvent[],
  zhNames: Record<string, string>,
): CompactEvent[] {
  return raw.map((e) => ({
    id: e.id,
    eventType: e.eventType,
    name: e.name,
    nameZh: zhNames[String(e.id)],
    startAt: e.startAt ?? 0,
    aggregateAt: e.aggregateAt ?? 0,
    rankingAnnounceAt: e.rankingAnnounceAt ?? 0,
    distributionEndAt: e.distributionEndAt ?? 0,
    unit: e.unit ?? "none",
  }));
}

export function buildGachas(raw: RawGacha[]): CompactGacha[] {
  return raw.map((g) => {
    const rates: GachaRate[] = (g.gachaCardRarityRates ?? [])
      .filter((r) => r.rate > 0)
      .map((r) => ({
        rarity: r.cardRarityType,
        lotteryType: r.lotteryType ?? "normal",
        rate: r.rate,
      }));
    const cards: GachaPoolEntry[] = (g.gachaDetails ?? []).map((d) => ({
      cardId: d.cardId,
      weight: d.weight,
      isWish: d.isWish === true,
    }));
    return {
      id: g.id,
      gachaType: g.gachaType,
      name: g.name,
      seq: g.seq,
      startAt: g.startAt,
      endAt: g.endAt,
      isShowPeriod: g.isShowPeriod !== false,
      rates,
      cards,
    };
  });
}

export function buildProfiles(raw: RawCharacterProfile[]): CharacterProfile[] {
  return raw.map((p) => ({
    characterId: p.characterId,
    voice: p.characterVoice ?? "",
    birthday: p.birthday ?? "",
    height: p.height ?? "",
    school: p.school ?? "",
    schoolYear: p.schoolYear ?? "",
    hobby: p.hobby ?? "",
    specialSkill: p.specialSkill ?? "",
    favoriteFood: p.favoriteFood ?? "",
    hatedFood: p.hatedFood ?? "",
    weak: p.weak ?? "",
    introduction: p.introduction ?? "",
  }));
}
