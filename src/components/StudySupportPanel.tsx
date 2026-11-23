import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Check,
  Clock,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react';
import { getCurrentDailyKey } from '../data/missions';
import {
  addStudyLog,
  addStudyNote,
  addStudyTask,
  deleteStudyLog,
  deleteStudyNote,
  deleteStudyTask,
  STUDY_SUBJECTS,
  toggleStudyNoteReviewed,
  toggleStudyTask,
} from '../services/studyService';
import { StudyLog, StudyNote, StudySubject, StudyTask } from '../types/student';

interface StudySupportPanelProps {
  uid: string;
  studyLogs: StudyLog[];
  studyTasks: StudyTask[];
  studyNotes: StudyNote[];
  loading: boolean;
  onBackToDashboard: () => void;
}

const TIMER_PRESETS = [
  { label: '25분 집중', minutes: 25 },
  { label: '50분 심화', minutes: 50 },
  { label: '15분 요약', minutes: 15 },
];

function formatDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatTotalMinutes(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}분`;
  return `${hrs}시간 ${mins}분`;
}

export function StudySupportPanel({
  uid,
  studyLogs,
  studyTasks,
  studyNotes,
  loading,
  onBackToDashboard,
}: StudySupportPanelProps) {
  // Timer state
  const [presetMinutes, setPresetMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [timerSubject, setTimerSubject] = useState<StudySubject>('수학');
  const [timerTopic, setTimerTopic] = useState('');
  const [savingLog, setSavingLog] = useState(false);
  const [timerFeedback, setTimerFeedback] = useState<string | null>(null);

  // Task state
  const [taskSubject, setTaskSubject] = useState<StudySubject>('수학');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskFilter, setTaskFilter] = useState<'all' | StudySubject>('all');
  const [savingTask, setSavingTask] = useState(false);

  // Note state
  const [noteSubject, setNoteSubject] = useState<StudySubject>('영어');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteFilter, setNoteFilter] = useState<'all' | StudySubject>('all');
  const [noteSearch, setNoteSearch] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const todayKey = getCurrentDailyKey();

  const statsSummary = useMemo(() => {
    const todayMinutes = studyLogs
      .filter((l) => l.dateKey === todayKey)
      .reduce((acc, item) => acc + item.minutes, 0);
    const totalMinutes = studyLogs.reduce((acc, item) => acc + item.minutes, 0);
    const doneTasks = studyTasks.filter((t) => t.completed).length;
    const reviewedNotes = studyNotes.filter((n) => n.reviewed).length;
    return {
      todayMinutes,
      totalMinutes,
      doneTasks,
      totalTasks: studyTasks.length,
      reviewedNotes,
      totalNotes: studyNotes.length,
    };
  }, [studyLogs, studyTasks, studyNotes, todayKey]);

  const filteredTasks = useMemo(() => {
    return studyTasks.filter((t) => taskFilter === 'all' || t.subject === taskFilter);
  }, [studyTasks, taskFilter]);

  const filteredNotes = useMemo(() => {
    const q = noteSearch.trim().toLowerCase();
    return studyNotes.filter((n) => {
      if (noteFilter !== 'all' && n.subject !== noteFilter) return false;
      if (
        q &&
        !n.title.toLowerCase().includes(q) &&
        !n.content.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [studyNotes, noteFilter, noteSearch]);

  const elapsedMinutes = Math.max(
    1,
    Math.round((presetMinutes * 60 - secondsLeft) / 60) || presetMinutes
  );

  const handleSelectPreset = (mins: number) => {
    setRunning(false);
    setPresetMinutes(mins);
    setSecondsLeft(mins * 60);
    setTimerFeedback(null);
  };

  const handleSaveStudySession = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setTimerFeedback(null);
    const minsToSave = secondsLeft === presetMinutes * 60 ? presetMinutes : elapsedMinutes;
    setSavingLog(true);
    try {
      await addStudyLog(uid, timerSubject, timerTopic || `${timerSubject} 집중 학습`, minsToSave);
      setTimerTopic('');
      setRunning(false);
      setSecondsLeft(presetMinutes * 60);
      setTimerFeedback(`${timerSubject} ${minsToSave}분 학습 기록이 저장되었습니다.`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '학습 기록 저장에 실패했습니다.');
    } finally {
      setSavingLog(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!taskTitle.trim()) return;
    setSavingTask(true);
    try {
      await addStudyTask(uid, taskSubject, taskTitle);
      setTaskTitle('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '학습 목표 등록에 실패했습니다.');
    } finally {
      setSavingTask(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSavingNote(true);
    try {
      await addStudyNote(uid, noteSubject, noteTitle, noteContent);
      setNoteTitle('');
      setNoteContent('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '오답·개념 노트 저장에 실패했습니다.');
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Band */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#1B365D] mb-1">
            미션과 별도로 운영되는 자기주도 학습 도구
          </p>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            학업 역량 보조 프로그램
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            집중 타이머, 과목별 학습 목표, 시험 대비 오답·개념 노트를 개인 계정에 영구 보관합니다
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToDashboard}
          className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap self-start sm:self-center cursor-pointer"
        >
          대시보드로 돌아가기
        </button>
      </section>

      {formError && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800"
        >
          {formError}
        </div>
      )}

      {/* 4-Column Academic KPI Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs text-slate-500">오늘 집중 학습</p>
          <p className="font-mono tabular-nums text-2xl font-bold text-slate-900 mt-1">
            {formatTotalMinutes(statsSummary.todayMinutes)}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs text-slate-500">누적 집중 학습</p>
          <p className="font-mono tabular-nums text-2xl font-bold text-slate-900 mt-1">
            {formatTotalMinutes(statsSummary.totalMinutes)}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs text-slate-500">과목별 목표 완료</p>
          <p className="font-mono tabular-nums text-2xl font-bold text-slate-900 mt-1">
            {statsSummary.doneTasks} / {statsSummary.totalTasks}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs text-slate-500">오답·개념 복습</p>
          <p className="font-mono tabular-nums text-2xl font-bold text-slate-900 mt-1">
            {statsSummary.reviewedNotes} / {statsSummary.totalNotes}
          </p>
        </div>
      </section>

      {/* Top Row: Focus Timer + Subject Study Tasks */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Focus Timer Card */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#1B365D]" />
                <h2 className="font-display text-lg font-bold text-slate-900">집중 학습 타이머</h2>
              </div>
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                {TIMER_PRESETS.map((preset) => (
                  <button
                    key={preset.minutes}
                    type="button"
                    onClick={() => handleSelectPreset(preset.minutes)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      presetMinutes === preset.minutes
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="py-8 text-center">
              <div className="font-mono tabular-nums text-5xl sm:text-6xl font-bold text-slate-900 tracking-tight">
                {formatDuration(secondsLeft)}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {secondsLeft === 0
                  ? '목표 집중 시간이 완료되었습니다. 아래에서 기록을 저장하세요.'
                  : running
                    ? '집중 학습 진행 중입니다'
                    : '시작 버튼을 누르거나 완료한 학습 시간을 바로 기록할 수 있습니다'}
              </p>

              <div className="mt-5 flex items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setRunning((r) => !r)}
                  disabled={secondsLeft === 0}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#1B365D] text-white text-sm font-semibold rounded-lg hover:bg-[#142847] disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{running ? '일시정지' : '타이머 시작'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset(presetMinutes)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>재설정</span>
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveStudySession} className="pt-4 border-t border-slate-100 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <select
                value={timerSubject}
                onChange={(e) => setTimerSubject(e.target.value as StudySubject)}
                aria-label="학습 과목 선택"
                className="col-span-1 px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#1B365D]"
              >
                {STUDY_SUBJECTS.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
              <input
                type="text"
                maxLength={100}
                value={timerTopic}
                onChange={(e) => setTimerTopic(e.target.value)}
                placeholder="학습 단원·주제 입력"
                className="col-span-2 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1B365D]"
              />
            </div>

            {timerFeedback && (
              <p className="text-xs text-emerald-700 font-medium">{timerFeedback}</p>
            )}

            <button
              type="submit"
              disabled={savingLog}
              className="w-full py-2.5 px-4 text-xs font-semibold text-[#1B365D] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              {savingLog
                ? '저장 중...'
                : `학습 세션 기록하기 (${
                    secondsLeft === presetMinutes * 60 ? presetMinutes : elapsedMinutes
                  }분)`}
            </button>
          </form>
        </div>

        {/* Subject Study Tasks */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                과목별 학습 목표 체크리스트
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                오늘·이번 주 끝내야 할 교과 과제를 과목별로 관리하세요
              </p>
            </div>
            <select
              value={taskFilter}
              onChange={(e) => setTaskFilter(e.target.value as 'all' | StudySubject)}
              aria-label="과목 필터"
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 self-start sm:self-auto"
            >
              <option value="all">전체 과목</option>
              {STUDY_SUBJECTS.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleAddTask} className="py-4 flex flex-col sm:flex-row gap-2 border-b border-slate-100">
            <select
              value={taskSubject}
              onChange={(e) => setTaskSubject(e.target.value as StudySubject)}
              aria-label="과제 과목"
              className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 shrink-0"
            >
              {STUDY_SUBJECTS.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
            <input
              type="text"
              maxLength={100}
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="예: 수학1 삼각함수 기출 15문항 풀이"
              className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1B365D]"
            />
            <button
              type="submit"
              disabled={savingTask || !taskTitle.trim()}
              className="inline-flex items-center justify-center gap-1 px-4 py-2 bg-[#1B365D] text-white text-xs font-semibold rounded-lg hover:bg-[#142847] disabled:opacity-50 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>목표 추가</span>
            </button>
          </form>

          <div className="flex-1 overflow-y-auto max-h-80">
            {loading ? (
              <div className="py-6 space-y-2.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                등록된 학습 목표가 없습니다. 위 입력창에서 첫 과목별 목표를 추가해 보세요.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {filteredTasks.map((task) => (
                  <li key={task.id} className="py-3 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => void toggleStudyTask(uid, task.id, !task.completed)}
                      className="flex items-center gap-3 text-left min-w-0 flex-1 cursor-pointer"
                    >
                      <span
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          task.completed
                            ? 'bg-[#1B365D] border-[#1B365D] text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {task.completed && <Check className="w-3 h-3" />}
                      </span>
                      <span className="text-xs text-slate-500 shrink-0 font-medium">
                        {task.subject}
                      </span>
                      <span className="text-slate-300 shrink-0" aria-hidden="true">
                        ·
                      </span>
                      <span
                        className={`text-sm truncate ${
                          task.completed ? 'text-slate-400 line-through' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteStudyTask(uid, task.id)}
                      aria-label="목표 삭제"
                      className="p-1.5 text-slate-400 hover:text-rose-700 rounded-md transition-colors shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Bottom Section: Wrong-Answer & Concept Review Vault + Recent Focus Sessions */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Concept & Mistake Notes */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#1B365D]" />
              <h2 className="font-display text-lg font-bold text-slate-900">
                시험 대비 오답·핵심 개념 노트
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={noteFilter}
                onChange={(e) => setNoteFilter(e.target.value as 'all' | StudySubject)}
                aria-label="노트 과목 필터"
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
              >
                <option value="all">전체 과목</option>
                {STUDY_SUBJECTS.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={noteSearch}
                  onChange={(e) => setNoteSearch(e.target.value)}
                  placeholder="개념 검색"
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 w-36 sm:w-44 focus:outline-none focus:bg-white focus:border-[#1B365D]"
                />
              </div>
            </div>
          </div>

          <form onSubmit={handleAddNote} className="py-4 border-b border-slate-100 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <select
                value={noteSubject}
                onChange={(e) => setNoteSubject(e.target.value as StudySubject)}
                aria-label="노트 과목"
                className="sm:col-span-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
              >
                {STUDY_SUBJECTS.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
              <input
                type="text"
                maxLength={80}
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="단원 또는 문제 제목 (예: 미적분 치환적분 부호 실수)"
                className="sm:col-span-3 px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1B365D]"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <textarea
                rows={2}
                maxLength={500}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="핵심 공식, 틀린 이유, 다음 시험에서 주의할 포인트를 정리하세요 (최대 500자)"
                className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1B365D] resize-none"
              />
              <button
                type="submit"
                disabled={savingNote || !noteTitle.trim() || !noteContent.trim()}
                className="px-4 py-2 bg-[#1B365D] text-white text-xs font-semibold rounded-lg hover:bg-[#142847] disabled:opacity-50 transition-colors whitespace-nowrap self-end sm:self-stretch cursor-pointer"
              >
                {savingNote ? '저장 중...' : '노트 저장'}
              </button>
            </div>
          </form>

          {filteredNotes.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              저장된 오답·핵심 개념 노트가 없습니다. 자주 틀리는 개념을 기록해 시험 직전에 빠르게
              복습해 보세요.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filteredNotes.map((note) => (
                <li key={note.id} className="py-4 flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                      <span className="font-medium text-slate-700">{note.subject}</span>
                      <span aria-hidden="true">·</span>
                      <span className={note.reviewed ? 'text-emerald-700 font-medium' : 'text-amber-700'}>
                        {note.reviewed ? '복습 완료' : '복습 필요'}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900">{note.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => void toggleStudyNoteReviewed(uid, note.id, !note.reviewed)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                        note.reviewed
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {note.reviewed ? '복습됨' : '복습 체크'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteStudyNote(uid, note.id)}
                      aria-label="노트 삭제"
                      className="p-1.5 text-slate-400 hover:text-rose-700 rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Study Timer Logs */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="font-display text-lg font-bold text-slate-900">최근 집중 학습 기록</h2>
            <p className="text-xs text-slate-500 mt-0.5">타이머로 저장한 과목별 공부 내역</p>
          </div>

          {studyLogs.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              아직 기록된 학습 세션이 없습니다.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
              {studyLogs.slice(0, 20).map((log) => (
                <li key={log.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="font-mono tabular-nums">{log.dateKey}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-medium text-slate-700">{log.subject}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-900 truncate mt-0.5">
                      {log.topic}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono tabular-nums text-xs font-semibold text-[#1B365D]">
                      {log.minutes}분
                    </span>
                    <button
                      type="button"
                      onClick={() => void deleteStudyLog(uid, log.id)}
                      aria-label="학습 기록 삭제"
                      className="p-1 text-slate-400 hover:text-rose-700 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
