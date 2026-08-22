export type CardRarity =
  | "rarity_1"
  | "rarity_2"
  | "rarity_3"
  | "rarity_4"
  | "rarity_birthday";

export type CardAttr = "cute" | "cool" | "pure" | "happy";

export type MusicDifficulty =
  | "easy"
  | "normal"
  | "hard"
  | "expert"
  | "master"
  | "append";

export interface CompactCharacter {
  id: number;
  seq: number;
  firstName: string;
  givenName: string;
  firstNameRuby: string;
  givenNameRuby: string;
  firstNameEn: string;
  givenNameEn: string;
  unit: string;
  supportUnitType: string;
  nameZh?: string;
  unitName?: string;
  colorCode?: string;
  modelName?: string;
  iconFileName?: string;
}

export interface CompactCard {
  id: number;
  seq: number;
  characterId: number;
  rarity: CardRarity;
  attr: CardAttr;
  assetbundleName: string;
  prefix: string;
  prefixZh?: string;
  cardSkillName: string;
  skillId: number;
  releaseAt: number;
  hasTrained: boolean;
  maxPower?: number;
  trainedPower?: number;
}

export interface MusicDiff {
  difficulty: MusicDifficulty;
  playLevel: number;
  totalNoteCount: number;
}

export interface CompactMusic {
  id: number;
  title: string;
  titleZh?: string;
  artist?: string;
  lyricist: string;
  composer: string;
  arranger: string;
  categories: string[];
  assetbundleName: string;
  publishedAt: number;
  difficulties: MusicDiff[];
  vocals?: string[];
}

export interface CompactEvent {
  id: number;
  eventType: string;
  name: string;
  nameZh?: string;
  startAt: number;
  aggregateAt: number;
  rankingAnnounceAt: number;
  distributionEndAt: number;
  unit: string;
}

export interface GachaRate {
  rarity: CardRarity;
  lotteryType: "normal" | "guarantee";
  rate: number;
}

export interface GachaPoolEntry {
  cardId: number;
  weight: number;
  isWish: boolean;
}

export interface CompactGacha {
  id: number;
  gachaType: string;
  name: string;
  seq: number;
  startAt: number;
  endAt: number;
  isShowPeriod: boolean;
  rates: GachaRate[];
  cards: GachaPoolEntry[];
}

export interface CharacterProfile {
  characterId: number;
  voice: string;
  birthday: string;
  height: string;
  school: string;
  schoolYear: string;
  hobby: string;
  specialSkill: string;
  favoriteFood: string;
  hatedFood: string;
  weak: string;
  introduction: string;
}

export interface PulledCard {
  card: CompactCard;
  character?: CompactCharacter;
  guarantee: boolean;
}

export interface GachaResult {
  gacha: CompactGacha;
  pulls: PulledCard[];
  counts: Record<string, number>;
  totalPower?: number;
}
