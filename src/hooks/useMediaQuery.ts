'use client';

import { useState, useEffect, useCallback } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  const handleChange = useCallback((event: MediaQueryListEvent | MediaQueryList) => {
    setMatches(event.matches);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);

    // 초기값 설정
    setMatches(mediaQuery.matches);

    // 변경 감지
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query, handleChange]);

  return matches;
}

// 미리 정의된 반응형 브레이크포인트 훅들
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 639px)');
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

export function useIsLargeDesktop(): boolean {
  return useMediaQuery('(min-width: 1280px)');
}

// 다크모드 감지
export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

// 움직임 감소 선호 감지
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

// 터치 디바이스 감지
export function useIsTouchDevice(): boolean {
  return useMediaQuery('(hover: none) and (pointer: coarse)');
}

// 브레이크포인트 타입
type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpoints: Record<Breakpoint, string> = {
  xs: '(max-width: 475px)',
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
};

export function useBreakpoint(breakpoint: Breakpoint): boolean {
  return useMediaQuery(breakpoints[breakpoint]);
}

// 현재 브레이크포인트 반환
export function useCurrentBreakpoint(): Breakpoint {
  const is2xl = useMediaQuery(breakpoints['2xl']);
  const isXl = useMediaQuery(breakpoints.xl);
  const isLg = useMediaQuery(breakpoints.lg);
  const isMd = useMediaQuery(breakpoints.md);
  const isSm = useMediaQuery(breakpoints.sm);

  if (is2xl) return '2xl';
  if (isXl) return 'xl';
  if (isLg) return 'lg';
  if (isMd) return 'md';
  if (isSm) return 'sm';
  return 'xs';
}

// 방향 감지
export function useOrientation(): 'portrait' | 'landscape' {
  const isPortrait = useMediaQuery('(orientation: portrait)');
  return isPortrait ? 'portrait' : 'landscape';
}
