'use client';

import { useEffect, useRef, RefObject } from 'react';

type Handler = (event: MouseEvent | TouchEvent) => void;

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: Handler,
  mouseEvent: 'mousedown' | 'mouseup' = 'mousedown'
): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (!el || el.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener(mouseEvent, listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener(mouseEvent, listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [handler, mouseEvent]);

  return ref;
}

// 여러 refs를 지원하는 버전
export function useClickOutsideMultiple<T extends HTMLElement = HTMLElement>(
  refs: RefObject<T>[],
  handler: Handler,
  mouseEvent: 'mousedown' | 'mouseup' = 'mousedown'
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const isOutside = refs.every((ref) => {
        const el = ref.current;
        return el && !el.contains(event.target as Node);
      });

      if (isOutside) {
        handler(event);
      }
    };

    document.addEventListener(mouseEvent, listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener(mouseEvent, listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [refs, handler, mouseEvent]);
}

// Escape 키도 함께 처리하는 버전
export function useClickOutsideWithEscape<T extends HTMLElement = HTMLElement>(
  handler: Handler,
  onEscape?: () => void,
  mouseEvent: 'mousedown' | 'mouseup' = 'mousedown'
): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const clickListener = (event: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (!el || el.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    const keyListener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onEscape?.();
      }
    };

    document.addEventListener(mouseEvent, clickListener);
    document.addEventListener('touchstart', clickListener);
    document.addEventListener('keydown', keyListener);

    return () => {
      document.removeEventListener(mouseEvent, clickListener);
      document.removeEventListener('touchstart', clickListener);
      document.removeEventListener('keydown', keyListener);
    };
  }, [handler, onEscape, mouseEvent]);

  return ref;
}
