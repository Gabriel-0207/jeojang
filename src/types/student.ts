export type StatKey =
  | 'academics'
  | 'fitness'
  | 'social'
  | 'leadership'
  | 'creativity'
  | 'mental';

export type GradeRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export type MissionPeriod = 'daily' | 'weekly' | 'monthly';

export type StudentStats = Record<StatKey, number>;

export interface StatDefinition {
  key: StatKey;
  label: string;
  shortLabel: string;
  description: string;
  accentHex: string;
}

export interface MissionDefinition {
  id: string;
  period: MissionPeriod;
  title: string;
  description: string;
  primaryStat: StatKey;
  statGains: Partial<StudentStats>;
  totalGain: number;
  pointReward: number;
}

export interface StudentProfile {
  uid: string;
  studentNumber: string;
  name: string;
  grade: GradeRank;
  totalScore: number;
  completedCount: number;
  points: number;
  stats: StudentStats;
  dailyKey: string;
  dailyCompleted: string[];
  weeklyKey: string;
  weeklyCompleted: string[];
  monthlyKey: string;
  monthlyCompleted: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface MissionLog {
  id: string;
  uid: string;
  missionId: string;
  missionTitle: string;
  period: MissionPeriod;
  periodKey: string;
  totalGain: number;
  note: string;
  createdAt?: { seconds: number; nanoseconds: number } | Date | null;
}

export interface GradeInfo {
  grade: GradeRank;
  title: string;
  subtitle: string;
  minScore: number;
  nextMinScore: number | null;
  badgeBgClass: string;
  badgeTextClass: string;
}

export type StudySubject = '국어' | '수학' | '영어' | '한국사/사회' | '과학' | '기타';

export interface StudyLog {
  id: string;
  uid: string;
  subject: StudySubject;
  topic: string;
  minutes: number;
  dateKey: string;
  createdAt?: { seconds: number; nanoseconds: number } | Date | null;
}

export interface StudyTask {
  id: string;
  uid: string;
  subject: StudySubject;
  title: string;
  completed: boolean;
  createdAt?: { seconds: number; nanoseconds: number } | Date | null;
  updatedAt?: { seconds: number; nanoseconds: number } | Date | null;
}

export interface StudyNote {
  id: string;
  uid: string;
  subject: StudySubject;
  title: string;
  content: string;
  reviewed: boolean;
  createdAt?: { seconds: number; nanoseconds: number } | Date | null;
  updatedAt?: { seconds: number; nanoseconds: number } | Date | null;
}

export type CharacterSkinTone = 'fair' | 'warm' | 'tan' | 'deep';
export type CharacterHairStyle =
  | 'short_neat'
  | 'two_block'
  | 'parted_curtain'
  | 'wavy_bob'
  | 'long_straight'
  | 'ponytail';
export type CharacterHairColor =
  | 'black'
  | 'dark_brown'
  | 'chestnut'
  | 'blonde'
  | 'crimson_red'
  | 'navy_tint'
  | 'emerald_tint'
  | 'violet_plum'
  | 'ash_gray'
  | 'platinum';
export type CharacterEyeStyle =
  | 'bright'
  | 'calm'
  | 'smile'
  | 'focused'
  | 'wink'
  | 'amber_orange'
  | 'rose_pink'
  | 'teal_mint'
  | 'silver_ice'
  | 'obsidian_dark';

export type CharacterSkinId =
  | 'novice_uniform'
  | 'track_runner'
  | 'arcane_scholar'
  | 'crimson_knight'
  | 'emerald_archer'
  | 'valkyrie_gold'
  | 'royal_paladin'
  | 'celestial_lord';

export interface CharacterBaseConfig {
  nickname: string;
  motto: string;
  skinTone: CharacterSkinTone;
  hairStyle: CharacterHairStyle;
  hairColor: CharacterHairColor;
  eyeStyle: CharacterEyeStyle;
}

export interface StudentCharacter extends CharacterBaseConfig {
  uid: string;
  equippedSkin: CharacterSkinId;
  ownedSkins: CharacterSkinId[];
  locked: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}
