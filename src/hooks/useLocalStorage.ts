'use client';

import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = T | ((prevValue: T) => T);

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void, () => void] {
  // 초기값 읽기
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // 마운트 시 로컬스토리지에서 읽기
  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  // 값 설정
  const setValue = useCallback(
    (value: SetValue<T>) => {
      if (typeof window === 'undefined') {
        console.warn(
          `Tried setting localStorage key "${key}" even though environment is not a client`
        );
        return;
      }

      try {
        const newValue = value instanceof Function ? value(storedValue) : value;
        window.localStorage.setItem(key, JSON.stringify(newValue));
        setStoredValue(newValue);

        // 다른 탭에서 동기화를 위한 이벤트 발생
        window.dispatchEvent(new Event('local-storage'));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // 값 제거
  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      window.dispatchEvent(new Event('local-storage'));
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // 다른 탭에서의 변경 감지
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        setStoredValue(JSON.parse(event.newValue));
      }
    };

    const handleLocalStorageChange = () => {
      setStoredValue(readValue());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleLocalStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleLocalStorageChange);
    };
  }, [key, readValue]);

  return [storedValue, setValue, removeValue];
}

// 세션 스토리지 버전
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void, () => void] {
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.sessionStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  const setValue = useCallback(
    (value: SetValue<T>) => {
      if (typeof window === 'undefined') {
        return;
      }

      try {
        const newValue = value instanceof Function ? value(storedValue) : value;
        window.sessionStorage.setItem(key, JSON.stringify(newValue));
        setStoredValue(newValue);
      } catch (error) {
        console.warn(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.sessionStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing sessionStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
