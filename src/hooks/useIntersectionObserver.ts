'use client';

import { useState, useEffect, useRef, RefObject, useCallback } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

interface IntersectionResult {
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
}

export function useIntersectionObserver<T extends Element = Element>(
  options: UseIntersectionObserverOptions = {}
): [RefObject<T>, IntersectionResult] {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false,
  } = options;

  const ref = useRef<T>(null);
  const [result, setResult] = useState<IntersectionResult>({
    isIntersecting: false,
    entry: null,
  });

  const frozen = result.isIntersecting && freezeOnceVisible;

  useEffect(() => {
    const element = ref.current;
    if (!element || frozen) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setResult({
          isIntersecting: entry.isIntersecting,
          entry,
        });
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, frozen]);

  return [ref, result];
}

// 간단한 가시성 감지
export function useIsVisible<T extends Element = Element>(
  options?: Omit<UseIntersectionObserverOptions, 'freezeOnceVisible'>
): [RefObject<T>, boolean] {
  const [ref, { isIntersecting }] = useIntersectionObserver<T>(options);
  return [ref, isIntersecting];
}

// 한 번만 감지 (애니메이션용)
export function useIsVisibleOnce<T extends Element = Element>(
  options?: Omit<UseIntersectionObserverOptions, 'freezeOnceVisible'>
): [RefObject<T>, boolean] {
  const [ref, { isIntersecting }] = useIntersectionObserver<T>({
    ...options,
    freezeOnceVisible: true,
  });
  return [ref, isIntersecting];
}

// 무한 스크롤용
interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

export function useInfiniteScroll<T extends Element = Element>(
  onLoadMore: () => void | Promise<void>,
  options: UseInfiniteScrollOptions = {}
): RefObject<T> {
  const { threshold = 0.1, rootMargin = '100px', enabled = true } = options;
  const ref = useRef<T>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (entry.isIntersecting && !loadingRef.current) {
          loadingRef.current = true;
          await onLoadMore();
          loadingRef.current = false;
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [onLoadMore, threshold, rootMargin, enabled]);

  return ref;
}

// 지연 로딩용
export function useLazyLoad<T extends Element = Element>(
  rootMargin: string = '200px'
): [RefObject<T>, boolean] {
  return useIsVisibleOnce<T>({ rootMargin });
}

// 스크롤 진행도 (0-1)
export function useScrollProgress<T extends Element = Element>(): [
  RefObject<T>,
  number
] {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementHeight = rect.height;

      // 요소가 화면 하단에 들어온 시점부터 상단으로 완전히 빠져나갈 때까지
      const start = windowHeight;
      const end = -elementHeight;
      const current = rect.top;

      const progressValue = (start - current) / (start - end);
      setProgress(Math.max(0, Math.min(1, progressValue)));
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return [ref, progress];
}

// 요소별 가시성 추적 (여러 요소)
export function useMultipleIntersection(
  ids: string[],
  options: UseIntersectionObserverOptions = {}
): Map<string, boolean> {
  const [visibilityMap, setVisibilityMap] = useState<Map<string, boolean>>(
    new Map(ids.map((id) => [id, false]))
  );

  const { threshold = 0, root = null, rootMargin = '0px' } = options;

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        setVisibilityMap((prev) => {
          const newMap = new Map(prev);
          entries.forEach((entry) => {
            if (entry.target.id) {
              newMap.set(entry.target.id, entry.isIntersecting);
            }
          });
          return newMap;
        });
      },
      { threshold, root, rootMargin }
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [ids, threshold, root, rootMargin]);

  return visibilityMap;
}
