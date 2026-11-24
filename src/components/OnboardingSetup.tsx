import React, { useState } from 'react';
import { Dices, Lock, LogOut, RotateCcw } from 'lucide-react';
import {
  createRandomCharacterBaseConfig,
  EYE_STYLE_OPTIONS,
  getDefaultCharacterBaseConfig,
  HAIR_COLOR_OPTIONS,
  SKIN_TONE_OPTIONS,
} from '../data/characterOptions';
import { validateStudentInput } from '../services/studentService';
import { CharacterBaseConfig } from '../types/student';
import { CharacterAvatar } from './CharacterAvatar';
import { SchoolCrest } from './SchoolCrest';

interface OnboardingSetupProps {
  mode?: 'full' | 'character-only';
  userEmail: string;
  defaultName: string;
  existingStudentNumber?: string;
  onSubmitFull?: (
    studentNumber: string,
    name: string,
    characterConfig: CharacterBaseConfig
  ) => Promise<void>;
  onSubmitCharacterOnly?: (characterConfig: CharacterBaseConfig) => Promise<void>;
  onResetAccount?: () => Promise<void>;
  onLogout: () => Promise<void>;
}

export function OnboardingSetup({
  mode = 'full',
  userEmail,
  defaultName,
  existingStudentNumber = '',
  onSubmitFull,
  onSubmitCharacterOnly,
  onResetAccount,
  onLogout,
}: OnboardingSetupProps) {
  const [studentNumber, setStudentNumber] = useState(existingStudentNumber);
  const [name, setName] = useState(defaultName);
  const [charDraft, setCharDraft] = useState<CharacterBaseConfig>(() =>
    getDefaultCharacterBaseConfig(defaultName)
  );
  const [nicknameEdited, setNicknameEdited] = useState(false);
  const [confirmedLock, setConfirmedLock] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [resettingAccount, setResettingAccount] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResetAccountClick = async () => {
    if (!onResetAccount) return;
    setError(null);
    setResettingAccount(true);
    try {
      await onResetAccount();
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인 정보 초기화 중 오류가 발생했습니다.');
    } finally {
      setResettingAccount(false);
      setResetConfirmOpen(false);
    }
  };

  const handleNameChange = (nextName: string) => {
    setName(nextName);
    if (!nicknameEdited) {
      setCharDraft((prev) => ({
        ...prev,
        nickname: nextName.trim().slice(0, 24) || '덕인 히어로',
      }));
    }
  };

  const handleRandomize = () => {
    setCharDraft(createRandomCharacterBaseConfig(charDraft.nickname));
  };

  const handleResetToDefaultCharacter = () => {
    const base = getDefaultCharacterBaseConfig(charDraft.nickname);
    setCharDraft((prev) => ({
      ...base,
      nickname: prev.nickname,
      motto: prev.motto,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'full') {
      const check = validateStudentInput(studentNumber, name);
      if (!check.valid) {
        setError(check.message ?? '입력 정보를 확인해 주세요.');
        return;
      }
      if (!charDraft.nickname.trim()) {
        setError('캐릭터 별명을 1~24자 이내로 입력해 주세요.');
        return;
      }
      if (!confirmedLock) {
        setError('캐릭터 영구 확정 안내에 동의 체크해 주세요.');
        return;
      }

      setSubmitting(true);
      try {
        await onSubmitFull?.(check.cleanNumber, check.cleanName, charDraft);
      } catch (err) {
        setError(err instanceof Error ? err.message : '학생 등록 중 오류가 발생했습니다.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!charDraft.nickname.trim()) {
      setError('캐릭터 별명을 1~24자 이내로 입력해 주세요.');
      return;
    }
    if (!confirmedLock) {
      setError('캐릭터 영구 확정 안내에 동의 체크해 주세요.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmitCharacterOnly?.(charDraft);
    } catch (err) {
      setError(err instanceof Error ? err.message : '캐릭터 생성 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
            <SchoolCrest size="sm" />
            <span className="font-display font-bold text-slate-900 text-base">
              목포덕인고등학교 능력치 시스템
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {onResetAccount && (
              <button
                type="button"
                onClick={() => setResetConfirmOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 whitespace-nowrap cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>로그인 정보 초기화</span>
              </button>
            )}
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>로그아웃</span>
            </button>
          </div>
        </div>
        {resetConfirmOpen && (
          <div className="bg-rose-50 border-t border-rose-200 px-6 py-3">
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-900">
              <span>
                현재 계정의 로그인·학생·캐릭터·기록 데이터를 모두 삭제하고 초기 로그인 화면으로 돌아갑니다.
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  disabled={resettingAccount}
                  onClick={() => setResetConfirmOpen(false)}
                  className="px-3 py-1.5 bg-white border border-rose-200 rounded-md text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="button"
                  disabled={resettingAccount}
                  onClick={handleResetAccountClick}
                  className="px-3 py-1.5 bg-rose-700 text-white font-semibold rounded-md hover:bg-rose-800 disabled:opacity-60 cursor-pointer"
                >
                  {resettingAccount ? '초기화 중...' : '전체 초기화 및 로그아웃'}
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 py-8 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: RPG Character Stage Preview */}
          <aside className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 sm:p-7 flex flex-col items-center text-center">
            <div className="w-full flex items-center justify-between gap-2 mb-4">
              <span className="text-xs font-semibold text-slate-500">나만의 2D 스쿨 RPG 캐릭터</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleResetToDefaultCharacter}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
                >
                  기본 외형
                </button>
                <button
                  type="button"
                  onClick={handleRandomize}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Dices className="w-3.5 h-3.5" />
                  <span>랜덤 조합</span>
                </button>
              </div>
            </div>

            <CharacterAvatar config={charDraft} skinId="novice_uniform" size="lg" />

            <div className="mt-4 w-full">
              <p className="font-display text-lg font-bold text-slate-900 truncate">
                {charDraft.nickname.trim() || '덕인 히어로'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                기본 스킨: 덕인 기본 교복 · E등급 시작
              </p>
              <p className="mt-3 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 leading-relaxed">
                {charDraft.motto.trim() || '오늘의 작은 실천이 내일의 실력이 된다'}
              </p>
            </div>

            <div className="mt-4 w-full p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-left text-xs text-amber-950 leading-relaxed flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                최초 생성 시 설정한 <strong>기본 외형(피부 톤·머리 색상·눈 색상)과 별명·좌우명</strong>은
                영구 확정되어 <strong>다시는 바꿀 수 없습니다.</strong> 이후 미션을 클리어해 얻은
                포인트로 스킨 상점에서 다양한 스쿨·테마 스킨을 구매·교체할 수 있습니다.
              </span>
            </div>
          </aside>

          {/* Right: Registration & Character Customization Form */}
          <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
            <div className="flex items-center gap-3.5 pb-5 mb-6 border-b border-slate-100">
              <SchoolCrest size="md" />
              <div>
                <h1 className="font-display text-xl font-bold text-slate-900">
                  {mode === 'full' ? '최초 로그인 등록 및 캐릭터 생성' : '나만의 캐릭터 최초 생성'}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[300px]">
                  {userEmail}
                  {mode === 'character-only' && existingStudentNumber
                    ? ` · ${existingStudentNumber} ${defaultName}`
                    : ''}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === 'full' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-5 border-b border-slate-100">
                  <div>
                    <label
                      htmlFor="studentNumber"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      학번 (필수)
                    </label>
                    <input
                      id="studentNumber"
                      type="text"
                      required
                      maxLength={20}
                      value={studentNumber}
                      onChange={(e) => setStudentNumber(e.target.value)}
                      placeholder="예: 10315"
                      className="w-full px-3.5 py-2.5 text-sm font-mono bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B365D]/20 focus:border-[#1B365D]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="studentName"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      이름 (필수)
                    </label>
                    <input
                      id="studentName"
                      type="text"
                      required
                      maxLength={30}
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="예: 김덕인"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B365D]/20 focus:border-[#1B365D]"
                    />
                  </div>
                </div>
              )}

              {/* Nickname & Motto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="charNickname"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    캐릭터 별명 (1~24자 · 변경 불가)
                  </label>
                  <input
                    id="charNickname"
                    type="text"
                    required
                    maxLength={24}
                    value={charDraft.nickname}
                    onChange={(e) => {
                      setNicknameEdited(true);
                      setCharDraft((prev) => ({ ...prev, nickname: e.target.value }));
                    }}
                    placeholder="예: 덕인 수호자"
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#1B365D]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="charMotto"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    나의 다짐 (최대 60자 · 변경 불가)
                  </label>
                  <input
                    id="charMotto"
                    type="text"
                    maxLength={60}
                    value={charDraft.motto}
                    onChange={(e) => setCharDraft((prev) => ({ ...prev, motto: e.target.value }))}
                    placeholder="학교생활 목표를 적어주세요"
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#1B365D]"
                  />
                </div>
              </div>

              {/* Skin Tone */}
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2">피부 톤</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SKIN_TONE_OPTIONS.map((opt) => {
                    const active = charDraft.skinTone === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setCharDraft((prev) => ({ ...prev, skinTone: opt.id }))}
                        className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                          active
                            ? 'border-[#1B365D] bg-slate-900 text-white'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-slate-300 shrink-0"
                          style={{ backgroundColor: opt.fill }}
                        />
                        <span className="truncate">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hair Color */}
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2">머리 색상</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {HAIR_COLOR_OPTIONS.map((opt) => {
                    const active = charDraft.hairColor === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setCharDraft((prev) => ({ ...prev, hairColor: opt.id }))}
                        className={`flex items-center gap-2 px-2.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                          active
                            ? 'border-[#1B365D] bg-slate-900 text-white'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0"
                          style={{ backgroundColor: opt.fill }}
                        />
                        <span className="truncate">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Eye Color */}
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2">눈 색상</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {EYE_STYLE_OPTIONS.map((opt) => {
                    const active = charDraft.eyeStyle === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setCharDraft((prev) => ({ ...prev, eyeStyle: opt.id }))}
                        className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                          active
                            ? 'border-[#1B365D] bg-[#1B365D] text-white'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-slate-300/80 shrink-0"
                          style={{ backgroundColor: opt.iris }}
                        />
                        <span className="truncate">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Permanent Confirmation Checkbox */}
              <label className="flex items-start gap-2.5 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmedLock}
                  onChange={(e) => setConfirmedLock(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[#1B365D] focus:ring-[#1B365D]"
                />
                <span className="leading-relaxed">
                  한 번 생성한 캐릭터의 기본 외형과 별명은 <strong className="text-slate-900">다시는 변경할 수 없음</strong>을
                  확인했으며, 이 모습으로 확정합니다.
                </span>
              </label>

              {error && (
                <div
                  role="alert"
                  className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 bg-[#1B365D] text-white text-sm font-semibold rounded-lg hover:bg-[#142847] disabled:opacity-60 transition-colors cursor-pointer"
              >
                {submitting
                  ? '캐릭터 확정 저장 중...'
                  : mode === 'full'
                    ? '캐릭터 확정 및 E등급으로 시작하기'
                    : '내 캐릭터 영구 확정하고 시작하기'}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
