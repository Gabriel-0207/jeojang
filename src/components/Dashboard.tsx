import { useMemo, useState } from 'react';
import {
  Award,
  Check,
  Coins,
  Edit3,
  LogOut,
  RotateCcw,
  Search,
  ShoppingBag,
  X,
} from 'lucide-react';
import { SKIN_MAP } from '../data/characterOptions';
import {
  ALL_MISSIONS,
  DAILY_MISSIONS,
  getCurrentDailyKey,
  getCurrentMonthlyKey,
  getCurrentWeeklyKey,
  getEffectiveCompletedIds,
  getGradeInfo,
  GRADE_TIERS,
  MAX_STAT_VALUE,
  MONTHLY_MISSIONS,
  PERIOD_LABEL_MAP,
  STAT_DEFINITIONS,
  STAT_LABEL_MAP,
  WEEKLY_MISSIONS,
} from '../data/missions';
import {
  GradeRank,
  MissionDefinition,
  MissionLog,
  MissionPeriod,
  StatKey,
  StudentCharacter,
  StudentProfile,
  StudyLog,
  StudyNote,
  StudyTask,
} from '../types/student';
import { CharacterAvatar } from './CharacterAvatar';
import { CharacterStudio } from './CharacterStudio';
import { MissionCompletionModal } from './MissionCompletionModal';
import { ProfileEditModal } from './ProfileEditModal';
import { ResetRecordsModal } from './ResetRecordsModal';
import { SchoolCrest } from './SchoolCrest';
import { StatRadarChart } from './StatRadarChart';
import { StudySupportPanel } from './StudySupportPanel';

type NavSection = 'overview' | 'missions' | 'character' | 'study' | 'logs';
type PeriodFilter = 'all' | MissionPeriod;

interface DashboardProps {
  student: StudentProfile;
  character: StudentCharacter;
  userEmail: string;
  logs: MissionLog[];
  logsLoading: boolean;
  studyLogs: StudyLog[];
  studyTasks: StudyTask[];
  studyNotes: StudyNote[];
  studyLoading: boolean;
  onCompleteMission: (
    mission: MissionDefinition,
    note: string
  ) => Promise<{
    previousGrade: GradeRank;
    nextGrade: GradeRank;
    promoted: boolean;
    pointReward: number;
  }>;
  onUpdateIdentity: (studentNumber: string, name: string) => Promise<void>;
  onResetRecords: (includeProfile: boolean) => Promise<void>;
  onLogout: () => Promise<void>;
}

function formatLogTime(val: MissionLog['createdAt']): string {
  if (!val) return '방금 전';
  let date: Date;
  if (val instanceof Date) {
    date = val;
  } else if (typeof val === 'object' && 'seconds' in val) {
    date = new Date(val.seconds * 1000);
  } else {
    return '-';
  }
  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function Dashboard({
  student,
  character,
  userEmail,
  logs,
  logsLoading,
  studyLogs,
  studyTasks,
  studyNotes,
  studyLoading,
  onCompleteMission,
  onUpdateIdentity,
  onResetRecords,
  onLogout,
}: DashboardProps) {
  const [activeNav, setActiveNav] = useState<NavSection>('overview');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [statFilter, setStatFilter] = useState<'all' | StatKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hideCompleted, setHideCompleted] = useState(false);

  const [selectedMission, setSelectedMission] = useState<MissionDefinition | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [promotionBanner, setPromotionBanner] = useState<{
    from: GradeRank;
    to: GradeRank;
  } | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const currentDailyKey = getCurrentDailyKey();
  const currentWeeklyKey = getCurrentWeeklyKey();
  const currentMonthlyKey = getCurrentMonthlyKey();

  const dailyDoneIds = useMemo(
    () => getEffectiveCompletedIds('daily', student.dailyKey, student.dailyCompleted),
    [student.dailyKey, student.dailyCompleted]
  );
  const weeklyDoneIds = useMemo(
    () => getEffectiveCompletedIds('weekly', student.weeklyKey, student.weeklyCompleted),
    [student.weeklyKey, student.weeklyCompleted]
  );
  const monthlyDoneIds = useMemo(
    () => getEffectiveCompletedIds('monthly', student.monthlyKey, student.monthlyCompleted),
    [student.monthlyKey, student.monthlyCompleted]
  );

  const gradeInfo = getGradeInfo(student.grade);

  const rankProgressPercent = useMemo(() => {
    if (gradeInfo.nextMinScore === null) return 100;
    const span = gradeInfo.nextMinScore - gradeInfo.minScore;
    const gained = Math.max(0, student.totalScore - gradeInfo.minScore);
    return Math.min(100, Math.round((gained / span) * 100));
  }, [gradeInfo, student.totalScore]);

  const pointsRemaining =
    gradeInfo.nextMinScore === null ? 0 : Math.max(0, gradeInfo.nextMinScore - student.totalScore);

  const isMissionDone = (mission: MissionDefinition): boolean => {
    if (mission.period === 'daily') return dailyDoneIds.includes(mission.id);
    if (mission.period === 'weekly') return weeklyDoneIds.includes(mission.id);
    return monthlyDoneIds.includes(mission.id);
  };

  const filteredMissions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ALL_MISSIONS.filter((mission) => {
      if (periodFilter !== 'all' && mission.period !== periodFilter) return false;
      if (statFilter !== 'all' && !(statFilter in mission.statGains)) return false;
      if (hideCompleted && isMissionDone(mission)) return false;
      if (q && !mission.title.toLowerCase().includes(q) && !mission.description.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [periodFilter, statFilter, hideCompleted, searchQuery, dailyDoneIds, weeklyDoneIds, monthlyDoneIds]);

  const handleNavClick = (section: NavSection) => {
    setActiveNav(section);
    if (section === 'overview') {
      setPeriodFilter('all');
    }
  };

  const handleConfirmCompletion = async (mission: MissionDefinition, note: string) => {
    const result = await onCompleteMission(mission, note);
    setFeedbackMessage(
      `"${mission.title}" 완료 · 능력치 +${mission.totalGain} · +${result.pointReward} P 획득`
    );
    if (result.promoted) {
      setPromotionBanner({ from: result.previousGrade, to: result.nextGrade });
    }
  };

  const equippedSkin = SKIN_MAP[character.equippedSkin] ?? SKIN_MAP.novice_uniform;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Strict 3-Zone Top Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => handleNavClick('overview')}
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer text-left"
          >
            <SchoolCrest size="sm" />
            <span className="font-display font-bold text-slate-900 text-base tracking-tight">
              목포덕인고등학교 능력치 시스템
            </span>
          </button>

          {/* Zone 2: Clean single-line Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            {(
              [
                { id: 'overview', label: '대시보드' },
                { id: 'missions', label: '성장 임무' },
                { id: 'character', label: '캐릭터 상점' },
                { id: 'study', label: '학업 보조' },
                { id: 'logs', label: '성장 기록' },
              ] as { id: NavSection; label: string }[]
            ).map((nav) => (
              <button
                key={nav.id}
                type="button"
                onClick={() => handleNavClick(nav.id)}
                className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                  activeNav === nav.id
                    ? 'border-[#1B365D] text-slate-900 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                {nav.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>로그아웃</span>
            </button>
          </div>
        </div>

        {/* Compact Mobile Navigation Row */}
        <div className="lg:hidden border-t border-slate-100 px-4 py-2 flex items-center gap-3 overflow-x-auto text-xs font-medium">
          {(
            [
              { id: 'overview', label: '대시보드' },
              { id: 'missions', label: '성장 임무' },
              { id: 'character', label: '캐릭터 상점' },
              { id: 'study', label: '학업 보조' },
              { id: 'logs', label: '성장 기록' },
            ] as { id: NavSection; label: string }[]
          ).map((nav) => (
            <button
              key={nav.id}
              type="button"
              onClick={() => handleNavClick(nav.id)}
              className={`whitespace-nowrap shrink-0 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                activeNav === nav.id
                  ? 'bg-[#1B365D] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {nav.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Promotion Notification */}
        {promotionBanner && (
          <div
            role="status"
            className="bg-[#1B365D] text-white rounded-xl p-5 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <Award className="w-6 h-6 text-amber-300 shrink-0" />
              <div>
                <p className="font-display font-bold text-base">
                  등급 승급 달성: {promotionBanner.from}등급 → {promotionBanner.to}등급
                </p>
                <p className="text-xs text-slate-200 mt-0.5">
                  꾸준한 학교 생활 임무 실천으로 새로운 등급({getGradeInfo(promotionBanner.to).title})에
                  도달했습니다.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPromotionBanner(null)}
              aria-label="승급 알림 닫기"
              className="p-1.5 text-slate-300 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Toast-like inline feedback */}
        {feedbackMessage && !promotionBanner && (
          <div
            role="status"
            className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl px-4 py-3 flex items-center justify-between gap-4 text-sm"
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackMessage(null)}
              aria-label="알림 닫기"
              className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {activeNav === 'character' ? (
          <CharacterStudio
            student={student}
            character={character}
            onGoToMissions={() => handleNavClick('missions')}
            onBackToDashboard={() => handleNavClick('overview')}
          />
        ) : activeNav === 'study' ? (
          <StudySupportPanel
            uid={student.uid}
            studyLogs={studyLogs}
            studyTasks={studyTasks}
            studyNotes={studyNotes}
            loading={studyLoading}
            onBackToDashboard={() => handleNavClick('overview')}
          />
        ) : activeNav !== 'logs' ? (
          <>
            {activeNav === 'overview' && (
              <>
            {/* Hero Split: Identity + 6 Stats on Left, Radar Chart on Right */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  {/* Student Header with Pixel RPG Character */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
                    <div className="flex items-start gap-4 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleNavClick('character')}
                        aria-label="캐릭터 스킨 상점 열기"
                        className="shrink-0 group text-left cursor-pointer focus:outline-none"
                      >
                        <CharacterAvatar
                          config={character}
                          skinId={character.equippedSkin}
                          size="sm"
                          className="group-hover:border-[#1B365D] transition-colors"
                        />
                      </button>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-1">
                          <span className="font-mono tabular-nums">{student.studentNumber}</span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate">{userEmail}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mr-1">
                            {student.name}
                          </h1>
                          <button
                            type="button"
                            onClick={() => setProfileModalOpen(true)}
                            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors whitespace-nowrap cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>정보 수정</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setResetModalOpen(true)}
                            className="inline-flex items-center gap-1 text-xs text-rose-700 hover:text-rose-900 px-2 py-1 rounded-md hover:bg-rose-50 transition-colors whitespace-nowrap cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>기록 초기화</span>
                          </button>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
                          <span className="font-semibold text-slate-800">{character.nickname}</span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-slate-600">{equippedSkin.name}</span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="inline-flex items-center gap-1 font-mono tabular-nums font-bold text-amber-700">
                            <Coins className="w-3.5 h-3.5 text-amber-600" />
                            {student.points} P
                          </span>
                          <button
                            type="button"
                            onClick={() => handleNavClick('character')}
                            className="inline-flex items-center gap-1 font-semibold text-[#1B365D] hover:underline whitespace-nowrap cursor-pointer"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span>스킨 상점</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-start">
                      <div
                        className={`px-4 py-2 rounded-lg font-display font-bold text-xl tabular-nums ${gradeInfo.badgeBgClass}`}
                      >
                        {student.grade}등급
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">{gradeInfo.title}</p>
                        <p className="text-xs text-slate-500 font-mono tabular-nums">
                          총합 {student.totalScore}점
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Next Grade Progress */}
                  <div className="py-5 border-b border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-slate-600 font-medium">{gradeInfo.subtitle}</span>
                      <span className="font-mono tabular-nums text-slate-700 font-semibold">
                        {gradeInfo.nextMinScore === null
                          ? '최고 등급 달성'
                          : `다음 등급까지 ${pointsRemaining}점`}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1B365D] rounded-full transition-all duration-300"
                        style={{ width: `${rankProgressPercent}%` }}
                      />
                    </div>
                    <div className="mt-3 grid grid-cols-6 gap-1.5 text-center">
                      {GRADE_TIERS.map((tier) => {
                        const isCurrent = tier.grade === student.grade;
                        const isPassed = student.totalScore >= tier.minScore;
                        return (
                          <div
                            key={tier.grade}
                            className={`py-1 rounded text-xs font-mono tabular-nums ${
                              isCurrent
                                ? 'bg-[#1B365D] text-white font-bold'
                                : isPassed
                                  ? 'bg-slate-100 text-slate-700 font-medium'
                                  : 'bg-slate-50 text-slate-400'
                            }`}
                          >
                            {tier.grade} ({tier.minScore})
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 6 Core Stat Bars */}
                <div className="pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-slate-900">6대 핵심 능력치 상세</h2>
                    <span className="text-xs text-slate-500">각 능력치 최대 {MAX_STAT_VALUE}점 · 등급은 누적 총점 기준</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5">
                    {STAT_DEFINITIONS.map((def) => {
                      const val = student.stats[def.key];
                      const pct = Math.min(100, Math.round((val / MAX_STAT_VALUE) * 100));
                      return (
                        <div key={def.key}>
                          <div className="flex items-baseline justify-between text-xs mb-1">
                            <span className="font-medium text-slate-700">{def.label}</span>
                            <span className="font-mono tabular-nums font-semibold text-slate-900">
                              {val} / {MAX_STAT_VALUE}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: def.accentHex,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Hexagon Radar */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    능력치 균형 분포도
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    여섯 가지 학교 생활 역량의 균형을 한눈에 확인하세요
                  </p>
                </div>

                <div className="my-4 flex-1 flex items-center justify-center">
                  <StatRadarChart stats={student.stats} />
                </div>
              </div>
            </section>

            {/* Full-Width 4-Column KPI Strip */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <p className="text-xs text-slate-500">누적 완료 임무</p>
                <p className="font-mono tabular-nums text-2xl font-bold text-slate-900 mt-1">
                  {student.completedCount}건
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <p className="text-xs text-slate-500">일일 임무 ({currentDailyKey})</p>
                <p className="font-mono tabular-nums text-2xl font-bold text-slate-900 mt-1">
                  {dailyDoneIds.length} / {DAILY_MISSIONS.length}
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <p className="text-xs text-slate-500">주간 임무 ({currentWeeklyKey})</p>
                <p className="font-mono tabular-nums text-2xl font-bold text-slate-900 mt-1">
                  {weeklyDoneIds.length} / {WEEKLY_MISSIONS.length}
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <p className="text-xs text-slate-500">월간 임무 ({currentMonthlyKey})</p>
                <p className="font-mono tabular-nums text-2xl font-bold text-slate-900 mt-1">
                  {monthlyDoneIds.length} / {MONTHLY_MISSIONS.length}
                </p>
              </div>
            </section>
              </>
            )}

            {/* Mission Workspace */}
            <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <h2 className="font-display text-xl font-bold text-slate-900">
                    학교 생활 성장 임무
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    일일 12개 · 주간 6개 · 월간 3개 임무를 수행하고 능력치를 획득하세요
                  </p>
                </div>

                {/* Segmented Period Tabs */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start lg:self-auto overflow-x-auto max-w-full">
                  {(
                    [
                      { key: 'all', label: `전체 ${ALL_MISSIONS.length}` },
                      { key: 'daily', label: `일일 ${DAILY_MISSIONS.length}` },
                      { key: 'weekly', label: `주간 ${WEEKLY_MISSIONS.length}` },
                      { key: 'monthly', label: `월간 ${MONTHLY_MISSIONS.length}` },
                    ] as { key: PeriodFilter; label: string }[]
                  ).map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setPeriodFilter(tab.key)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        periodFilter === tab.key
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter & Search Toolbar */}
              <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                  <button
                    type="button"
                    onClick={() => setStatFilter('all')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      statFilter === 'all'
                        ? 'bg-[#1B365D] text-white border-[#1B365D]'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    전체 능력치
                  </button>
                  {STAT_DEFINITIONS.map((def) => (
                    <button
                      key={def.key}
                      type="button"
                      onClick={() => setStatFilter(def.key)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        statFilter === def.key
                          ? 'bg-[#1B365D] text-white border-[#1B365D]'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {def.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={hideCompleted}
                      onChange={(e) => setHideCompleted(e.target.checked)}
                      className="rounded border-slate-300 text-[#1B365D] focus:ring-[#1B365D]"
                    />
                    <span>미완료만 보기</span>
                  </label>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="임무 검색"
                      className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#1B365D] w-40 sm:w-48"
                    />
                  </div>
                </div>
              </div>

              {/* Mission List */}
              {filteredMissions.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm font-medium text-slate-700">
                    조건에 해당하는 임무가 없습니다
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    필터나 검색어를 초기화하면 모든 임무를 확인할 수 있습니다.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setPeriodFilter('all');
                      setStatFilter('all');
                      setHideCompleted(false);
                      setSearchQuery('');
                    }}
                    className="mt-4 px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    필터 초기화
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {filteredMissions.map((mission) => {
                    const done = isMissionDone(mission);
                    const gainSummary = (Object.entries(mission.statGains) as [StatKey, number][])
                      .map(([k, v]) => `${STAT_LABEL_MAP[k]} +${v}`)
                      .join(' · ');

                    return (
                      <li
                        key={mission.id}
                        className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-1">
                            <span className="font-medium text-slate-700">
                              {PERIOD_LABEL_MAP[mission.period]}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums text-[#1B365D] font-medium">
                              {gainSummary}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums font-semibold text-amber-700">
                              +{mission.pointReward} P
                            </span>
                          </div>
                          <h3
                            className={`text-sm font-semibold ${
                              done ? 'text-slate-400 line-through' : 'text-slate-900'
                            }`}
                          >
                            {mission.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {mission.description}
                          </p>
                        </div>

                        <div className="shrink-0 self-start sm:self-center">
                          {done ? (
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg whitespace-nowrap">
                              <Check className="w-3.5 h-3.5" />
                              <span>완료됨</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedMission(mission)}
                              className="px-4 py-2 text-xs font-semibold text-white bg-[#1B365D] rounded-lg hover:bg-[#142847] transition-colors whitespace-nowrap cursor-pointer"
                            >
                              완료하기
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </>
        ) : (
          /* Activity Logs View */
          <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <h1 className="font-display text-xl font-bold text-slate-900">
                  나의 성장 활동 기록
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  완료한 일일·주간·월간 임무와 획득한 능력치 내역입니다
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleNavClick('overview')}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                대시보드로 돌아가기
              </button>
            </div>

            {logsLoading ? (
              <div className="py-8 space-y-3">
                {[1, 2, 3, 4].map((row) => (
                  <div key={row} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm font-medium text-slate-700">아직 완료한 임무 기록이 없습니다</p>
                <p className="text-xs text-slate-500 mt-1">
                  첫 번째 일일 임무를 완료하면 성장 기록이 이곳에 차곡차곡 쌓입니다.
                </p>
                <button
                  type="button"
                  onClick={() => handleNavClick('missions')}
                  className="mt-5 px-4 py-2 text-xs font-semibold text-white bg-[#1B365D] rounded-lg hover:bg-[#142847] transition-colors cursor-pointer"
                >
                  성장 임무 보러가기
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs text-slate-500">
                      <th className="py-3 pr-4 font-medium">일시</th>
                      <th className="py-3 px-4 font-medium">구분</th>
                      <th className="py-3 px-4 font-medium">임무명</th>
                      <th className="py-3 px-4 font-medium">실천 메모</th>
                      <th className="py-3 pl-4 font-medium text-right">획득 점수</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70">
                        <td className="py-3 pr-4 font-mono tabular-nums text-xs text-slate-500 whitespace-nowrap">
                          {formatLogTime(log.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                          {PERIOD_LABEL_MAP[log.period]} · {log.periodKey}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900">
                          {log.missionTitle}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500 max-w-xs truncate">
                          {log.note || '-'}
                        </td>
                        <td className="py-3 pl-4 text-right font-mono tabular-nums font-semibold text-[#1B365D] whitespace-nowrap">
                          +{log.totalGain}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>목포덕인고등학교 학교 생활 능력치 향상 프로그램</span>
          <span>일일 임무 12 · 주간 임무 6 · 월간 임무 3</span>
        </div>
      </footer>

      <MissionCompletionModal
        mission={selectedMission}
        onClose={() => setSelectedMission(null)}
        onConfirm={handleConfirmCompletion}
      />

      <ProfileEditModal
        isOpen={profileModalOpen}
        initialStudentNumber={student.studentNumber}
        initialName={student.name}
        onClose={() => setProfileModalOpen(false)}
        onSave={onUpdateIdentity}
      />

      <ResetRecordsModal
        isOpen={resetModalOpen}
        studentNumber={student.studentNumber}
        name={student.name}
        onClose={() => setResetModalOpen(false)}
        onConfirmReset={async (includeProfile) => {
          await onResetRecords(includeProfile);
          setPromotionBanner(null);
          if (!includeProfile) {
            setFeedbackMessage('능력치·등급(E등급)·포인트·임무 기록이 모두 초기화되었습니다.');
          }
        }}
      />
    </div>
  );
}
