import {
  GradeInfo,
  GradeRank,
  MissionDefinition,
  MissionPeriod,
  StatDefinition,
  StatKey,
  StudentStats,
} from '../types/student';

export const INITIAL_STAT_VALUE = 10;
export const MAX_STAT_VALUE = 100;

export const INITIAL_STATS: StudentStats = {
  academics: INITIAL_STAT_VALUE,
  fitness: INITIAL_STAT_VALUE,
  social: INITIAL_STAT_VALUE,
  leadership: INITIAL_STAT_VALUE,
  creativity: INITIAL_STAT_VALUE,
  mental: INITIAL_STAT_VALUE,
};

export const STAT_DEFINITIONS: StatDefinition[] = [
  {
    key: 'academics',
    label: '학업/지력',
    shortLabel: '학업',
    description: '수업 집중도, 자기주도 학습, 교과 탐구 및 문제 해결 역량',
    accentHex: '#1B365D',
  },
  {
    key: 'fitness',
    label: '체력/운동',
    shortLabel: '체력',
    description: '기초 체력 관리, 스포츠 활동, 꾸준한 신체 건강 유지 습관',
    accentHex: '#0F766E',
  },
  {
    key: 'social',
    label: '사교/친화력',
    shortLabel: '사교',
    description: '교우 관계, 선후배 소통, 공감 및 따뜻한 배려의 학교 생활',
    accentHex: '#0369A1',
  },
  {
    key: 'leadership',
    label: '리더십/평판',
    shortLabel: '리더십',
    description: '공동체 솔선수범, 학급·동아리 기여, 신뢰받는 행동력',
    accentHex: '#B45309',
  },
  {
    key: 'creativity',
    label: '예술/창의력',
    shortLabel: '창의',
    description: '독서, 문화·예술 감수성, 독창적인 아이디어와 표현 활동',
    accentHex: '#7C3AED',
  },
  {
    key: 'mental',
    label: '멘탈/성실성',
    shortLabel: '멘탈',
    description: '시간 약속 준수, 자기 관리, 꾸준한 계획 실행 및 회복탄력성',
    accentHex: '#334155',
  },
];

export const STAT_LABEL_MAP: Record<StatKey, string> = {
  academics: '학업/지력',
  fitness: '체력/운동',
  social: '사교/친화력',
  leadership: '리더십/평판',
  creativity: '예술/창의력',
  mental: '멘탈/성실성',
};

export const GRADE_TIERS: GradeInfo[] = [
  {
    grade: 'E',
    title: '새싹 덕인인',
    subtitle: '입문 단계 · 학교 생활의 첫걸음을 내딛는 출발점',
    minScore: 60,
    nextMinScore: 144,
    badgeBgClass: 'bg-slate-800 text-white',
    badgeTextClass: 'text-slate-700',
  },
  {
    grade: 'D',
    title: '도약 덕인인',
    subtitle: '기본 생활 루틴을 안정적으로 다져가는 성장 단계',
    minScore: 144,
    nextMinScore: 300,
    badgeBgClass: 'bg-teal-800 text-white',
    badgeTextClass: 'text-teal-800',
  },
  {
    grade: 'C',
    title: '균형 덕인인',
    subtitle: '학업과 체력, 교우 관계가 조화를 이루는 단계',
    minScore: 300,
    nextMinScore: 540,
    badgeBgClass: 'bg-sky-800 text-white',
    badgeTextClass: 'text-sky-800',
  },
  {
    grade: 'B',
    title: '모범 덕인인',
    subtitle: '교내 활동에서 꾸준함과 신뢰를 증명하는 정예 단계',
    minScore: 540,
    nextMinScore: 840,
    badgeBgClass: 'bg-indigo-900 text-white',
    badgeTextClass: 'text-indigo-900',
  },
  {
    grade: 'A',
    title: '선도 덕인인',
    subtitle: '다방면의 역량으로 학급과 학교를 이끄는 명예 단계',
    minScore: 840,
    nextMinScore: 1200,
    badgeBgClass: 'bg-amber-700 text-white',
    badgeTextClass: 'text-amber-800',
  },
  {
    grade: 'S',
    title: '덕인 마스터',
    subtitle: '6대 핵심 역량을 모두 높은 수준으로 완성한 최고 등급',
    minScore: 1200,
    nextMinScore: null,
    badgeBgClass: 'bg-[#1B365D] text-amber-300',
    badgeTextClass: 'text-[#1B365D]',
  },
];

export function calculateTotalScore(stats: StudentStats): number {
  return (
    stats.academics +
    stats.fitness +
    stats.social +
    stats.leadership +
    stats.creativity +
    stats.mental
  );
}

export function calculateGradeForScore(totalScore: number): GradeRank {
  if (totalScore >= 1200) return 'S';
  if (totalScore >= 840) return 'A';
  if (totalScore >= 540) return 'B';
  if (totalScore >= 300) return 'C';
  if (totalScore >= 144) return 'D';
  return 'E';
}

export function getGradeInfo(grade: GradeRank): GradeInfo {
  return GRADE_TIERS.find((tier) => tier.grade === grade) ?? GRADE_TIERS[0];
}

// 일일임무 12개 (6개 능력치 x 2개씩)
export const DAILY_MISSIONS: MissionDefinition[] = [
  {
    id: 'daily_acad_01',
    period: 'daily',
    title: '수업 핵심 필기 정리 및 당일 복습 30분',
    description: '오늘 들은 수업 중 중요 개념을 노트에 구조화하고 방과 후 30분 이상 복습합니다.',
    primaryStat: 'academics',
    statGains: { academics: 3 },
    totalGain: 3,
  },
  {
    id: 'daily_acad_02',
    period: 'daily',
    title: '영단어 30개 암기 또는 수학 10문제 완주',
    description: '매일 기초 교과 루틴을 끊기지 않도록 단어 암기나 문제 풀이를 직접 완수합니다.',
    primaryStat: 'academics',
    statGains: { academics: 3 },
    totalGain: 3,
  },
  {
    id: 'daily_fit_01',
    period: 'daily',
    title: '점심·방과 후 운동장 러닝 또는 빠르게 걷기 20분',
    description: '책상에서 벗어나 운동장에서 20분 이상 규칙적인 유산소 활동으로 활력을 채웁니다.',
    primaryStat: 'fitness',
    statGains: { fitness: 3 },
    totalGain: 3,
  },
  {
    id: 'daily_fit_02',
    period: 'daily',
    title: '쉬는 시간 스트레칭 및 바른 자세 루틴 실천',
    description: '목·어깨 스트레칭과 물 500ml 이상 수분 섭취로 하루 컨디션을 관리합니다.',
    primaryStat: 'fitness',
    statGains: { fitness: 2 },
    totalGain: 2,
  },
  {
    id: 'daily_soc_01',
    period: 'daily',
    title: '선생님·친구·선후배에게 먼저 반갑게 인사하기',
    description: '등하굣길과 복도에서 마주치는 학교 구성원에게 밝은 인사와 짧은 안부를 건넵니다.',
    primaryStat: 'social',
    statGains: { social: 2 },
    totalGain: 2,
  },
  {
    id: 'daily_soc_02',
    period: 'daily',
    title: '학급 친구에게 학습 또는 학교 생활 도움 건네기',
    description: '모르는 문제를 함께 고민하거나 준비물·과제 안내를 친절히 공유합니다.',
    primaryStat: 'social',
    statGains: { social: 3 },
    totalGain: 3,
  },
  {
    id: 'daily_lead_01',
    period: 'daily',
    title: '교실·특별실 분리수거 및 자리 뒷정리 솔선수범',
    description: '내 자리 주변은 물론 공용 공간 정리에 먼저 나서서 쾌적한 학습 환경을 만듭니다.',
    primaryStat: 'leadership',
    statGains: { leadership: 3 },
    totalGain: 3,
  },
  {
    id: 'daily_lead_02',
    period: 'daily',
    title: '모둠·토론 수업에서 의견 경청 및 핵심 요약하기',
    description: '동료의 발언을 끝까지 듣고 논점을 정리해 모둠 활동이 원활히 흐르도록 돕습니다.',
    primaryStat: 'leadership',
    statGains: { leadership: 3 },
    totalGain: 3,
  },
  {
    id: 'daily_cre_01',
    period: 'daily',
    title: '인문·교양 도서 20분 읽기 및 생각 3줄 기록',
    description: '교과 외 독서를 통해 시야를 넓히고 인상 깊었던 문장과 생각을 짧게 남깁니다.',
    primaryStat: 'creativity',
    statGains: { creativity: 3 },
    totalGain: 3,
  },
  {
    id: 'daily_cre_02',
    period: 'daily',
    title: '오늘의 아이디어 스케치 또는 음악·작품 감상',
    description: '하루 중 영감을 준 장면, 멜로디, 글귀를 관찰하고 나만의 관점으로 기록합니다.',
    primaryStat: 'creativity',
    statGains: { creativity: 2 },
    totalGain: 2,
  },
  {
    id: 'daily_men_01',
    period: 'daily',
    title: '조회 시간 10분 전 등교 및 지각 없는 하루 완주',
    description: '여유 있는 등교로 하루 첫 수업 전 마음가짐을 정돈하고 출결 기본을 지킵니다.',
    primaryStat: 'mental',
    statGains: { mental: 3 },
    totalGain: 3,
  },
  {
    id: 'daily_men_02',
    period: 'daily',
    title: '오늘의 학습 플래너 작성 및 취침 전 자기 점검',
    description: '아침에 세운 할 일 목록을 저녁에 점검하며 성실한 시간 관리 습관을 기릅니다.',
    primaryStat: 'mental',
    statGains: { mental: 2 },
    totalGain: 2,
  },
];

// 주간임무 6개 (6개 능력치 x 1개씩)
export const WEEKLY_MISSIONS: MissionDefinition[] = [
  {
    id: 'weekly_acad_01',
    period: 'weekly',
    title: '주간 오답노트 정리 및 취약 단원 심화 학습',
    description: '한 주 동안 틀렸던 문제와 헷갈린 개념을 한 곳에 모아 원인을 분석하고 재풀이합니다.',
    primaryStat: 'academics',
    statGains: { academics: 10 },
    totalGain: 10,
  },
  {
    id: 'weekly_fit_01',
    period: 'weekly',
    title: '주 3회 이상 땀 흘리는 스포츠·체력 단련 완수',
    description: '체육 수업이나 방과 후 축구·농구·배드민턴·웨이트 등 30분 이상 운동을 주 3회 실천합니다.',
    primaryStat: 'fitness',
    statGains: { fitness: 10 },
    totalGain: 10,
  },
  {
    id: 'weekly_soc_01',
    period: 'weekly',
    title: '평소 대화가 적었던 친구와 식사·소통 시간 갖기',
    description: '새로운 학우와 진솔한 대화를 나누며 학급 내 유대감을 넓힙니다.',
    primaryStat: 'social',
    statGains: { social: 10 },
    totalGain: 10,
  },
  {
    id: 'weekly_lead_01',
    period: 'weekly',
    title: '학급 자치·동아리 회의 참여 및 맡은 역할 책임 완수',
    description: '자치 회의에서 건설적인 제안을 하거나 동아리/1인 1역 업무를 성실히 완결합니다.',
    primaryStat: 'leadership',
    statGains: { leadership: 10 },
    totalGain: 10,
  },
  {
    id: 'weekly_cre_01',
    period: 'weekly',
    title: '에세이·드로잉·발표 자료 등 주간 창작물 1편 완성',
    description: '글쓰기, 그림, 코딩, 영상, 디자인 등 나만의 결과물 1건을 완성해 포트폴리오에 쌓습니다.',
    primaryStat: 'creativity',
    statGains: { creativity: 10 },
    totalGain: 10,
  },
  {
    id: 'weekly_men_01',
    period: 'weekly',
    title: '일주일 학습·생활 플래너 실천률 80% 이상 달성',
    description: '월요일부터 금요일까지 스스로 정한 규칙과 공부 시간을 흔들림 없이 지켜냅니다.',
    primaryStat: 'mental',
    statGains: { mental: 10 },
    totalGain: 10,
  },
];

// 월간임무 3개 (복합 핵심 역량 챌린지)
export const MONTHLY_MISSIONS: MissionDefinition[] = [
  {
    id: 'monthly_01',
    period: 'monthly',
    title: '월간 양서 2권 완독 및 심화 서평 작성',
    description: '전공·진로 및 인문 도서 2권을 끝까지 읽고 A4 1장 분량의 비평적 독후감을 완성합니다.',
    primaryStat: 'academics',
    statGains: { academics: 20, mental: 15 },
    totalGain: 35,
  },
  {
    id: 'monthly_02',
    period: 'monthly',
    title: '교내 체육·예술 프로젝트 또는 대회·발표회 참가',
    description: '학교 스포츠클럽 리그, 예술제, 동아리 학술 발표 등 목표가 있는 교내 챌린지를 완주합니다.',
    primaryStat: 'creativity',
    statGains: { fitness: 15, creativity: 20 },
    totalGain: 35,
  },
  {
    id: 'monthly_03',
    period: 'monthly',
    title: '교내외 봉사활동 또는 학급 공동체 캠페인 주도',
    description: '지역사회 봉사나 학교 내 긍정 문화를 확산하는 자치 캠페인을 기획하고 실행합니다.',
    primaryStat: 'leadership',
    statGains: { social: 15, leadership: 20 },
    totalGain: 35,
  },
];

export const ALL_MISSIONS: MissionDefinition[] = [
  ...DAILY_MISSIONS,
  ...WEEKLY_MISSIONS,
  ...MONTHLY_MISSIONS,
];

export const PERIOD_LABEL_MAP: Record<MissionPeriod, string> = {
  daily: '일일 임무',
  weekly: '주간 임무',
  monthly: '월간 임무',
};

function getSeoulNowParts(date = new Date()): { year: number; month: number; day: number } {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const year = Number(parts.find((p) => p.type === 'year')?.value ?? date.getFullYear());
  const month = Number(parts.find((p) => p.type === 'month')?.value ?? date.getMonth() + 1);
  const day = Number(parts.find((p) => p.type === 'day')?.value ?? date.getDate());
  return { year, month, day };
}

export function getCurrentDailyKey(date = new Date()): string {
  const { year, month, day } = getSeoulNowParts(date);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function getCurrentMonthlyKey(date = new Date()): string {
  const { year, month } = getSeoulNowParts(date);
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function getCurrentWeeklyKey(date = new Date()): string {
  const { year, month, day } = getSeoulNowParts(date);
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  const dayNum = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((utcDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${utcDate.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function getEffectiveCompletedIds(
  period: MissionPeriod,
  storedKey: string,
  storedIds: string[]
): string[] {
  const currentKey =
    period === 'daily'
      ? getCurrentDailyKey()
      : period === 'weekly'
        ? getCurrentWeeklyKey()
        : getCurrentMonthlyKey();
  return storedKey === currentKey ? storedIds : [];
}
