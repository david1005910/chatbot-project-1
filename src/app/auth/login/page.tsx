'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const { signInWithEmail, signInWithGoogle, signInWithKakao, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(error ? '인증 오류가 발생했습니다' : '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    const { error } = await signInWithEmail(email, password);

    if (error) {
      setErrorMessage(error.message === 'Invalid login credentials'
        ? '이메일 또는 비밀번호가 올바르지 않습니다'
        : error.message);
      setIsSubmitting(false);
    } else {
      router.push('/');
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
    }
  };

  const handleKakaoLogin = async () => {
    setIsSubmitting(true);
    const { error } = await signInWithKakao();
    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              로그인
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              쿠팡 소싱 도우미에 오신 것을 환영합니다
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {errorMessage}
            </div>
          )}

          {/* Social Login */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Google로 계속하기
              </span>
            </button>

            <button
              onClick={handleKakaoLogin}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#FEE500] rounded-lg hover:bg-[#FDD800] transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#000000">
                <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 01-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
              </svg>
              <span className="text-gray-900 font-medium">
                카카오로 계속하기
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                또는 이메일로 로그인
              </span>
            </div>
          </div>

          {/* Email Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link
                href="/auth/forgot-password"
                className="text-blue-600 hover:text-blue-800"
              >
                비밀번호를 잊으셨나요?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? '로그인 중...' : '로그인'}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            계정이 없으신가요?{' '}
            <Link
              href="/auth/signup"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              회원가입
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
