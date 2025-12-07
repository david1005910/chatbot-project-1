'use client';

import { useState, useEffect, useCallback } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: 0,
    height: 0,
  });

  const handleResize = useCallback(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 초기값 설정
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return windowSize;
}

// 디바운스된 버전
export function useWindowSizeDebounced(delay: number = 100): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, delay);
    };

    // 초기값 설정
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [delay]);

  return windowSize;
}

// 스크롤 위치 훅
interface ScrollPosition {
  x: number;
  y: number;
}

export function useScrollPosition(): ScrollPosition {
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      setScrollPosition({
        x: window.scrollX,
        y: window.scrollY,
      });
    };

    // 초기값 설정
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollPosition;
}

// 스크롤 방향 훅
type ScrollDirection = 'up' | 'down' | 'none';

export function useScrollDirection(threshold: number = 10): ScrollDirection {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>('none');
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - lastScrollY;

      if (Math.abs(diff) > threshold) {
        setScrollDirection(diff > 0 ? 'down' : 'up');
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, threshold]);

  return scrollDirection;
}

// 페이지 하단 도달 감지
export function useScrollToBottom(offset: number = 100): boolean {
  const [isBottom, setIsBottom] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      setIsBottom(scrollTop + windowHeight >= documentHeight - offset);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [offset]);

  return isBottom;
}

// 페이지 상단 여부 감지
export function useIsScrolledToTop(threshold: number = 0): boolean {
  const [isTop, setIsTop] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      setIsTop(window.scrollY <= threshold);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return isTop;
}

// 락 스크롤 훅
export function useLockScroll(): [boolean, (lock: boolean) => void] {
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isLocked) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isLocked]);

  return [isLocked, setIsLocked];
}
