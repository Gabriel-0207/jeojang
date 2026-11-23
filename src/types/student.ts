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
}

export interface StudentProfile {
  uid: string;
  studentNumber: string;
  name: string;
  grade: GradeRank;
  totalScore: number;
  completedCount: number;
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

