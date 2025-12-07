'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
  });

  const supabase = createClient();

  // Supabase 설정 확인
  const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_url' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your_supabase_anon_key';

  useEffect(() => {
    // Supabase가 설정되지 않은 경우 인증 비활성화
    if (!isSupabaseConfigured) {
      setAuthState({
        user: null,
        session: null,
        isLoading: false,
      });
      return;
    }

    // 초기 세션 가져오기
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setAuthState({
          user: session?.user ?? null,
          session,
          isLoading: false,
        });
      } catch (error) {
        console.warn('Supabase auth initialization failed:', error);
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
        });
      }
    };

    getInitialSession();

    // 인증 상태 변경 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setAuthState({
          user: session?.user ?? null,
          session,
          isLoading: false,
        });
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth, isSupabaseConfigured]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }, [supabase.auth]);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  }, [supabase.auth]);

  const signInWithGoogle = useCallback(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { data, error };
  }, [supabase.auth]);

  const signInWithKakao = useCallback(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { data, error };
  }, [supabase.auth]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  }, [supabase.auth]);

  const resetPassword = useCallback(async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { data, error };
  }, [supabase.auth]);

  return {
    ...authState,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithKakao,
    signOut,
    resetPassword,
  };
}
