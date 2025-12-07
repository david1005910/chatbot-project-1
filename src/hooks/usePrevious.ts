'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

// 이전 값 저장
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// 이전 값과 비교
export function usePreviousWithComparison<T>(
  value: T
): { previous: T | undefined; hasChanged: boolean } {
  const previous = usePrevious(value);
  const hasChanged = previous !== undefined && previous !== value;

  return { previous, hasChanged };
}

// 첫 렌더링 감지
export function useIsFirstRender(): boolean {
  const isFirst = useRef(true);

  useEffect(() => {
    isFirst.current = false;
  }, []);

  return isFirst.current;
}

// 마운트 후 첫 렌더링이 아닌지 확인
export function useIsMounted(): boolean {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
}

// 업데이트 시에만 실행
export function useUpdateEffect(effect: React.EffectCallback, deps?: React.DependencyList): void {
  const isFirstRender = useIsFirstRender();

  useEffect(() => {
    if (!isFirstRender) {
      return effect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// 값 히스토리 저장
export function useValueHistory<T>(value: T, maxHistory: number = 10): T[] {
  const [history, setHistory] = useState<T[]>([value]);

  useEffect(() => {
    setHistory((prev) => {
      const newHistory = [...prev, value];
      if (newHistory.length > maxHistory) {
        return newHistory.slice(-maxHistory);
      }
      return newHistory;
    });
  }, [value, maxHistory]);

  return history;
}

// 카운터 훅
interface UseCounterOptions {
  min?: number;
  max?: number;
  step?: number;
}

interface UseCounterReturn {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  set: (value: number) => void;
}

export function useCounter(
  initialValue: number = 0,
  options: UseCounterOptions = {}
): UseCounterReturn {
  const { min, max, step = 1 } = options;
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount((prev) => {
      const next = prev + step;
      if (max !== undefined && next > max) return prev;
      return next;
    });
  }, [step, max]);

  const decrement = useCallback(() => {
    setCount((prev) => {
      const next = prev - step;
      if (min !== undefined && next < min) return prev;
      return next;
    });
  }, [step, min]);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  const set = useCallback(
    (value: number) => {
      let newValue = value;
      if (min !== undefined) newValue = Math.max(min, newValue);
      if (max !== undefined) newValue = Math.min(max, newValue);
      setCount(newValue);
    },
    [min, max]
  );

  return { count, increment, decrement, reset, set };
}

// 토글 훅
export function useToggle(initialValue: boolean = false): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  return [value, toggle, setValue];
}

// 배열 상태 관리
interface UseArrayReturn<T> {
  value: T[];
  push: (item: T) => void;
  removeAt: (index: number) => void;
  remove: (item: T) => void;
  clear: () => void;
  filter: (predicate: (item: T) => boolean) => void;
  update: (index: number, newValue: T) => void;
  set: (newArray: T[]) => void;
}

export function useArray<T>(initialValue: T[] = []): UseArrayReturn<T> {
  const [value, setValue] = useState<T[]>(initialValue);

  const push = useCallback((item: T) => {
    setValue((prev) => [...prev, item]);
  }, []);

  const removeAt = useCallback((index: number) => {
    setValue((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const remove = useCallback((item: T) => {
    setValue((prev) => prev.filter((i) => i !== item));
  }, []);

  const clear = useCallback(() => {
    setValue([]);
  }, []);

  const filter = useCallback((predicate: (item: T) => boolean) => {
    setValue((prev) => prev.filter(predicate));
  }, []);

  const update = useCallback((index: number, newValue: T) => {
    setValue((prev) => prev.map((item, i) => (i === index ? newValue : item)));
  }, []);

  return { value, push, removeAt, remove, clear, filter, update, set: setValue };
}

// Map 상태 관리
interface UseMapReturn<K, V> {
  value: Map<K, V>;
  set: (key: K, value: V) => void;
  remove: (key: K) => void;
  clear: () => void;
  get: (key: K) => V | undefined;
  has: (key: K) => boolean;
  setAll: (map: Map<K, V>) => void;
}

export function useMap<K, V>(initialValue?: Map<K, V>): UseMapReturn<K, V> {
  const [map, setMap] = useState<Map<K, V>>(initialValue || new Map());

  const set = useCallback((key: K, value: V) => {
    setMap((prev) => new Map(prev).set(key, value));
  }, []);

  const remove = useCallback((key: K) => {
    setMap((prev) => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
  }, []);

  const clear = useCallback(() => {
    setMap(new Map());
  }, []);

  const get = useCallback((key: K) => map.get(key), [map]);

  const has = useCallback((key: K) => map.has(key), [map]);

  const setAll = useCallback((newMap: Map<K, V>) => {
    setMap(new Map(newMap));
  }, []);

  return { value: map, set, remove, clear, get, has, setAll };
}
