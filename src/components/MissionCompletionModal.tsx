import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { PERIOD_LABEL_MAP, STAT_LABEL_MAP } from '../data/missions';
import { MissionDefinition, StatKey } from '../types/student';

interface MissionCompletionModalProps {
  mission: MissionDefinition | null;
  onClose: () => void;
  onConfirm: (mission: MissionDefinition, note: string) => Promise<void>;
}

export function MissionCompletionModal({
  mission,
  onClose,
  onConfirm,
}: MissionCompletionModalProps) {
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!mission) return null;

  const gainEntries = Object.entries(mission.statGains) as [StatKey, number][];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onConfirm(mission, note);
      setNote('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '임무 완료 처리 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-[2px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mission-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-xs text-slate-500">
              {PERIOD_LABEL_MAP[mission.period]} · {STAT_LABEL_MAP[mission.primaryStat]}
            </p>
            <h2 id="mission-modal-title" className="font-display text-lg font-bold text-slate-900 mt-1">
              {mission.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed mb-5">{mission.description}</p>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1.5">획득 예정 능력치</p>
            <div className="flex flex-wrap gap-4">
              {gainEntries.map(([key, amount]) => (
                <div key={key} className="flex items-baseline gap-1.5">
                  <span className="text-sm font-semibold text-slate-900">{STAT_LABEL_MAP[key]}</span>
                  <span className="font-mono tabular-nums text-sm font-bold text-[#1B365D]">
                    +{amount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-xs font-medium text-slate-500 mb-1">상점 포인트 보상</p>
            <p className="font-mono tabular-nums text-sm font-bold text-amber-700">
              +{mission.pointReward} P
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="mission-note" className="block text-sm font-medium text-slate-800 mb-1.5">
              실천 소감 메모 (선택)
            </label>
            <textarea
              id="mission-note"
              rows={3}
              maxLength={150}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="오늘 실천한 내용이나 느낀 점을 간단히 남겨보세요 (최대 150자)"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B365D]/20 focus:border-[#1B365D] resize-none"
            />
            <div className="text-right text-xs font-mono tabular-nums text-slate-400 mt-1">
              {note.length} / 150
            </div>
          </div>

          {error && (
            <div role="alert" className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#1B365D] rounded-lg hover:bg-[#142847] disabled:opacity-60 transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? '저장 중...' : '임무 완료 등록'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
