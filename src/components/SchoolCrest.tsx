import { useState } from 'react';
import { GraduationCap } from 'lucide-react';

interface SchoolCrestProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'w-8 h-8 rounded-lg',
  md: 'w-12 h-12 rounded-xl',
  lg: 'w-20 h-20 rounded-2xl',
};

export function SchoolCrest({ size = 'md', className = '' }: SchoolCrestProps) {
  const [imgFailed, setImgFailed] = useState(false);

  if (imgFailed) {
    return (
      <div
        className={`${SIZE_CLASSES[size]} bg-[#1B365D] text-amber-300 flex items-center justify-center shrink-0 border border-slate-200 ${className}`}
        aria-label="목포덕인고등학교 교표"
      >
        <GraduationCap className={size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-10 h-10'} />
      </div>
    );
  }

  return (
    <div
      className={`${SIZE_CLASSES[size]} bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-0.5 ${className}`}
    >
      <img
        src="/assets/aistudio/______2026-11-23_102114_fd59dcb8.png"
        alt="목포덕인고등학교 교표"
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
        className="w-full h-full object-contain"
      />
    </div>
  );
}
