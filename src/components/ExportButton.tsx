'use client';

import { useState } from 'react';

interface ExportButtonProps {
  onExport: () => Promise<{ success: boolean; count?: number; error?: string }>;
  disabled?: boolean;
  label?: string;
  successMessage?: string;
}

export function ExportButton({
  onExport,
  disabled = false,
  label = 'Supabase로 내보내기',
  successMessage = '데이터가 저장되었습니다',
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleExport = async () => {
    setIsExporting(true);
    setStatus('idle');
    setMessage('');

    try {
      const result = await onExport();

      if (result.success) {
        setStatus('success');
        setMessage(result.count ? `${result.count}개 ${successMessage}` : successMessage);
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(result.error || '내보내기 실패');
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 5000);
      }
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : '내보내기 중 오류 발생');
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative inline-flex items-center gap-2">
      <button
        onClick={handleExport}
        disabled={disabled || isExporting}
        className={`
          inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
          ${disabled || isExporting
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            : status === 'success'
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : status === 'error'
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }
        `}
        title={label}
      >
        {isExporting ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>내보내는 중...</span>
          </>
        ) : status === 'success' ? (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>완료!</span>
          </>
        ) : status === 'error' ? (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>실패</span>
          </>
        ) : (
          <>
            {/* Supabase 아이콘 */}
            <svg className="w-4 h-4" viewBox="0 0 109 113" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="url(#paint0_linear)"/>
              <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="url(#paint1_linear)" fillOpacity="0.2"/>
              <path d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z" fill="#3ECF8E"/>
              <defs>
                <linearGradient id="paint0_linear" x1="53.9738" y1="54.974" x2="94.1635" y2="71.8295" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#249361"/>
                  <stop offset="1" stopColor="#3ECF8E"/>
                </linearGradient>
                <linearGradient id="paint1_linear" x1="36.1558" y1="30.578" x2="54.4844" y2="65.0806" gradientUnits="userSpaceOnUse">
                  <stop/>
                  <stop offset="1" stopOpacity="0"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="hidden sm:inline">{label}</span>
          </>
        )}
      </button>

      {/* 상태 메시지 툴팁 */}
      {message && (
        <div className={`
          absolute top-full left-0 mt-2 px-3 py-1.5 rounded text-xs whitespace-nowrap z-10
          ${status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}
        `}>
          {message}
        </div>
      )}
    </div>
  );
}

// 아이콘만 있는 작은 버전
export function ExportIconButton({
  onExport,
  disabled = false,
  title = 'Supabase로 저장',
}: {
  onExport: () => Promise<{ success: boolean; count?: number; error?: string }>;
  disabled?: boolean;
  title?: string;
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleExport = async () => {
    setIsExporting(true);
    setStatus('idle');

    try {
      const result = await onExport();
      setStatus(result.success ? 'success' : 'error');
      setTimeout(() => setStatus('idle'), 2000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled || isExporting}
      className={`
        p-2 rounded-lg transition-all
        ${disabled || isExporting
          ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
          : status === 'success'
          ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
          : status === 'error'
          ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
          : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
        }
      `}
      title={title}
    >
      {isExporting ? (
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : status === 'success' ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : status === 'error' ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 109 113" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z"/>
          <path d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z"/>
        </svg>
      )}
    </button>
  );
}
