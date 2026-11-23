import { useState } from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { STAT_DEFINITIONS } from '../data/missions';
import { SchoolCrest } from './SchoolCrest';

interface AuthLandingProps {
  onGoogleLogin: () => Promise<void>;
  error: string | null;
}

export function AuthLanding({ onGoogleLogin, error }: AuthLandingProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleClick = async () => {
    setSubmitting(true);
    try {
      await onGoogleLogin();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
            <SchoolCrest size="sm" />
            <span className="font-display font-bold text-slate-900 text-base tracking-tight">
              목포덕인고등학교 능력치 시스템
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <a href="#stats-overview" className="hover:text-slate-900 whitespace-nowrap shrink-0">
              6대 핵심 역량
            </a>
            <a href="#mission-system" className="hover:text-slate-900 whitespace-nowrap shrink-0">
              임무 체계
            </a>
            <a href="#rank-system" className="hover:text-slate-900 whitespace-nowrap shrink-0">
              등급 안내
            </a>
          </nav>

          <button
            type="button"
            onClick={handleClick}
            disabled={submitting}
            className="px-4 py-2 bg-[#1B365D] text-white text-sm font-medium rounded-lg hover:bg-[#142847] disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {submitting ? '로그인 중...' : '구글 로그인'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {/* Left Hero */}
          <div className="lg:col-span-7 flex flex-col justify-between bg-white border border-slate-200 rounded-xl p-8 lg:p-10">
            <div>
              <p className="text-xs font-medium text-[#1B365D] tracking-wide mb-3">
                목포덕인고등학교 학생 성장 포트폴리오
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-4">
                매일의 학교 생활이
                <br />
                나의 능력치와 등급이 됩니다
              </h1>
              <p className="text-base text-slate-600 leading-relaxed max-w-xl mb-8">
                구글 계정으로 로그인하고 학번과 이름을 등록하면 모든 학생이 <strong className="text-slate-900 font-semibold">E등급</strong>에서
                출발합니다. 일일 12개, 주간 6개, 월간 3개의 실천 임무를 완수하며 6가지 핵심 역량을
                균형 있게 키워 S등급까지 도전해 보세요.
              </p>

              {error && (
                <div
                  role="alert"
                  className="mb-6 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-800"
                >
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  type="button"
                  onClick={handleClick}
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#1B365D] text-white text-sm font-semibold rounded-lg hover:bg-[#142847] disabled:opacity-60 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <span>{submitting ? '구글 계정 연결 중...' : '구글 계정으로 로그인'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>학번·이름 등록 후 개인 기록이 안전하게 저장됩니다</span>
                </div>
              </div>
            </div>

            <div
              id="rank-system"
              className="mt-10 pt-6 border-t border-slate-100 grid grid-cols-3 sm:grid-cols-6 gap-3"
            >
              {[
                { rank: 'E', score: '60+' },
                { rank: 'D', score: '144+' },
                { rank: 'C', score: '300+' },
                { rank: 'B', score: '540+' },
                { rank: 'A', score: '840+' },
                { rank: 'S', score: '1200+' },
              ].map((item) => (
                <div
                  key={item.rank}
                  className="border border-slate-200 rounded-lg p-3 bg-slate-50 text-center"
                >
                  <div className="font-display text-lg font-bold text-[#1B365D]">{item.rank}등급</div>
                  <div className="font-mono tabular-nums text-xs text-slate-500 mt-0.5">
                    {item.score}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Summary Card */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <SchoolCrest size="md" />
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    6대 학교 생활 능력치
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    초기 각 10점 · 최대 100점 · 시작 총합 60점 (E등급)
                  </p>
                </div>
              </div>

              <ul id="stats-overview" className="divide-y divide-slate-100">
                {STAT_DEFINITIONS.map((stat) => (
                  <li key={stat.key} className="py-3 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{stat.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        {stat.description}
                      </p>
                    </div>
                    <span className="font-mono tabular-nums text-xs text-slate-500 shrink-0 pt-0.5">
                      기본 10
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              id="mission-system"
              className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600"
            >
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1B365D]" />
                일일 임무 12개
              </span>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <span>주간 임무 6개</span>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <span>월간 임무 3개</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
