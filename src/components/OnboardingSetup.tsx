import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { validateStudentInput } from '../services/studentService';
import { SchoolCrest } from './SchoolCrest';

interface OnboardingSetupProps {
  userEmail: string;
  defaultName: string;
  onSubmit: (studentNumber: string, name: string) => Promise<void>;
  onLogout: () => Promise<void>;
}

export function OnboardingSetup({
  userEmail,
  defaultName,
  onSubmit,
  onLogout,
}: OnboardingSetupProps) {
  const [studentNumber, setStudentNumber] = useState('');
  const [name, setName] = useState(defaultName);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const check = validateStudentInput(studentNumber, name);
    if (!check.valid) {
      setError(check.message ?? '입력 정보를 확인해 주세요.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(check.cleanNumber, check.cleanName);
    } catch (err) {
      setError(err instanceof Error ? err.message : '학생 등록 중 오류가 발생했습니다.');
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
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>로그아웃</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-8">
          <div className="flex items-center gap-3.5 mb-6 pb-5 border-b border-slate-100">
            <SchoolCrest size="md" />
            <div>
              <h1 className="font-display text-xl font-bold text-slate-900">
                학생 기본 정보 등록
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[240px]">
                {userEmail}
              </p>
            </div>
          </div>

          <div className="mb-6 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
            모든 학생은 최초 등록 시 <strong className="text-slate-900 font-semibold">E등급</strong> (6개 능력치 각 10점 · 총합 60점)으로 시작합니다. 일일·주간·월간 임무를 완수해 능력치를 높여 보세요.
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="studentNumber"
                className="block text-sm font-medium text-slate-800 mb-1.5"
              >
                학번
              </label>
              <input
                id="studentNumber"
                type="text"
                required
                maxLength={20}
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                placeholder="예: 10315 (학년·반·번호)"
                className="w-full px-3.5 py-2.5 text-sm font-mono bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B365D]/20 focus:border-[#1B365D]"
              />
            </div>

            <div>
              <label htmlFor="studentName" className="block text-sm font-medium text-slate-800 mb-1.5">
                이름
              </label>
              <input
                id="studentName"
                type="text"
                required
                maxLength={30}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 김덕인"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B365D]/20 focus:border-[#1B365D]"
              />
            </div>

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
              {submitting ? '등록 중...' : 'E등급으로 시작하기'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
