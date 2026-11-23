import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || '알 수 없는 오류가 발생했습니다.',
    };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Application ErrorBoundary:', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border border-slate-200 rounded-xl p-8">
            <p className="text-xs font-mono text-rose-700 mb-2">시스템 알림</p>
            <h1 className="text-xl font-bold text-slate-900 mb-3">
              데이터 처리 중 문제가 발생했습니다
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              잠시 후 다시 시도해 주세요. 문제가 계속되면 로그아웃 후 다시 구글 계정으로 로그인해
              주시기 바랍니다.
            </p>
            <pre className="text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700 overflow-x-auto mb-6">
              {this.state.message}
            </pre>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#1B365D] text-white text-sm font-medium rounded-lg hover:bg-[#142847] transition-colors cursor-pointer"
            >
              페이지 새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
