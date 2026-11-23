import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { validateStudentInput } from '../services/studentService';

interface ProfileEditModalProps {
  isOpen: boolean;
  initialStudentNumber: string;
  initialName: string;
  onClose: () => void;
  onSave: (studentNumber: string, name: string) => Promise<void>;
}

export function ProfileEditModal({
  isOpen,
  initialStudentNumber,
  initialName,
  onClose,
  onSave,
}: ProfileEditModalProps) {
  const [studentNumber, setStudentNumber] = useState(initialStudentNumber);
  const [name, setName] = useState(initialName);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStudentNumber(initialStudentNumber);
      setName(initialName);
      setError(null);
    }
  }, [isOpen, initialStudentNumber, initialName]);

  if (!isOpen) return null;

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
      await onSave(check.cleanNumber, check.cleanName);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '정보 수정 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-[2px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 id="profile-modal-title" className="font-display text-lg font-bold text-slate-900">
            학번 및 이름 수정
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-studentNumber" className="block text-sm font-medium text-slate-800 mb-1.5">
              학번
            </label>
            <input
              id="edit-studentNumber"
              type="text"
              required
              maxLength={20}
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm font-mono bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1B365D]/20 focus:border-[#1B365D]"
            />
          </div>

          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-slate-800 mb-1.5">
              이름
            </label>
            <input
              id="edit-name"
              type="text"
              required
              maxLength={30}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1B365D]/20 focus:border-[#1B365D]"
            />
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
              className="px-4 py-2 text-sm font-semibold text-white bg-[#1B365D] rounded-lg hover:bg-[#142847] disabled:opacity-60 transition-colors cursor-pointer"
            >
              {submitting ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
