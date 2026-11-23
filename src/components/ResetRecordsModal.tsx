import React, { useState } from 'react';
import { RotateCcw, X } from 'lucide-react';

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
  const [includeProfile, setIncludeProfile] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    if (submitting) return;
    setConfirmed(false);
    setIncludeProfile(false);
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmed) return;

    setError(null);
    setSubmitting(true);
    try {
      await onConfirmReset(includeProfile);
      setConfirmed(false);
      setIncludeProfile(false);
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
              프로그램 기록 초기화
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

        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900 leading-relaxed mb-5">
          초기화를 실행하면 지금까지 누적된 <strong>6대 능력치(각 10점 · 총합 60점)</strong>와{' '}
          <strong>등급(E등급)</strong>, 일일·주간·월간 임무 완료 상태 및 성장 활동 기록이 모두
          삭제되며 되돌릴 수 없습니다.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={includeProfile}
              onChange={(e) => setIncludeProfile(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-[#1B365D] focus:ring-[#1B365D]"
            />
            <span className="text-xs text-slate-700 leading-relaxed">
              <strong className="font-semibold text-slate-900">학번·이름 정보까지 함께 초기화</strong>
              <br />
              체크하면 학번과 이름을 새로 입력하는 초기 등록 화면으로 이동합니다.
            </span>
          </label>

          <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="rounded border-slate-300 text-rose-700 focus:ring-rose-700"
            />
            <span>위 내용을 확인했으며 기록을 영구적으로 초기화합니다.</span>
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
              <RotateCcw className="w-4 h-4" />
              <span>{submitting ? '초기화 중...' : '기록 초기화'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
