import React, { useState } from 'react';
import { RotateCcw, Trash2, X } from 'lucide-react';

interface ResetRecordsModalProps {
  isOpen: boolean;
  studentNumber: string;
  name: string;
  onClose: () => void;
  onConfirmReset: (includeProfile: boolean) => Promise<void>;
}

export function ResetRecordsModal({
  isOpen,
  studentNumber,
  name,
  onClose,
  onConfirmReset,
}: ResetRecordsModalProps) {
  const [resetMode, setResetMode] = useState<'stats_only' | 'full_account'>('stats_only');
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isFullReset = resetMode === 'full_account';

  const handleClose = () => {
    if (submitting) return;
    setConfirmed(false);
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmed) return;

    setError(null);
    setSubmitting(true);
    try {
      await onConfirmReset(isFullReset);
      setConfirmed(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '기록 초기화 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-[2px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-xs text-rose-700 font-medium">
              {studentNumber} · {name}
            </p>
            <h2 id="reset-modal-title" className="font-display text-lg font-bold text-slate-900 mt-0.5">
              기록 및 로그인 정보 초기화
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="닫기"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5 mb-4">
          <label
            className={`block p-3.5 rounded-lg border text-xs cursor-pointer transition-colors ${
              !isFullReset
                ? 'border-slate-900 bg-slate-50 text-slate-900'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <input
                type="radio"
                name="resetMode"
                checked={!isFullReset}
                onChange={() => {
                  setResetMode('stats_only');
                  setConfirmed(false);
                }}
                className="mt-0.5 text-slate-900 focus:ring-slate-900"
              />
              <div>
                <p className="font-semibold text-slate-900">능력치 · 임무 기록만 초기화</p>
                <p className="mt-1 leading-relaxed text-slate-600">
                  6대 능력치(60점 · E등급), 보유 포인트(0P), 임무 및 학습 기록을 초기화합니다. 캐릭터와 보유 스킨, 로그인 정보는 유지됩니다.
                </p>
              </div>
            </div>
          </label>

          <label
            className={`block p-3.5 rounded-lg border text-xs cursor-pointer transition-colors ${
              isFullReset
                ? 'border-rose-700 bg-rose-50 text-rose-950'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <input
                type="radio"
                name="resetMode"
                checked={isFullReset}
                onChange={() => {
                  setResetMode('full_account');
                  setConfirmed(false);
                }}
                className="mt-0.5 text-rose-700 focus:ring-rose-700"
              />
              <div>
                <p className="font-semibold text-rose-900">로그인 · 학생 · 캐릭터 전체 초기화</p>
                <p className="mt-1 leading-relaxed text-rose-800">
                  로그인 계정 데이터, 학번·이름, 캐릭터, 보유 스킨, 모든 임무·학습 기록을 완전히 삭제하고 로그아웃하여 처음부터 다시 시작합니다.
                </p>
              </div>
            </div>
          </label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="rounded border-slate-300 text-rose-700 focus:ring-rose-700"
            />
            <span>
              {isFullReset
                ? '모든 계정·로그인·캐릭터 데이터가 영구 삭제됨을 확인했습니다.'
                : '위 내용을 확인했으며 능력치 및 활동 기록을 초기화합니다.'}
            </span>
          </label>

          {error && (
            <div role="alert" className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!confirmed || submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-rose-700 rounded-lg hover:bg-rose-800 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isFullReset ? <Trash2 className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
              <span>
                {submitting
                  ? '초기화 중...'
                  : isFullReset
                    ? '전체 초기화 후 로그아웃'
                    : '기록 초기화'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
