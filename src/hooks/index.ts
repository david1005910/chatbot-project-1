// Custom hooks for the application

// Authentication hooks
export { useAuth } from './useAuth';

// Data fetching hooks
export { useNaverTrend } from './useNaverTrend';
export { useClaudeAnalysis } from './useClaudeAnalysis';
export { useLSTMPrediction } from './useLSTMPrediction';
export { useFetch, useLazyFetch } from './useFetch';

// Storage hooks
export { useAnalysisStorage, useSettings, useHistoryStorage } from './useStorage';
export { useFavorites } from './useFavorites';

// Form hooks
export { useForm } from './useForm';

// Utility hooks
export { useDebounce, useDebouncedCallback, useThrottledCallback } from './useDebounce';
export { useKeyboardShortcuts, useGlobalShortcuts, shortcutDescriptions } from './useKeyboardShortcuts';
export { useServiceWorker, useOnlineStatus } from './useServiceWorker';
export { useClipboard, copyToClipboard } from './useClipboard';
export { useLocalStorage, useSessionStorage } from './useLocalStorage';
export {
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsLargeDesktop,
  usePrefersDarkMode,
  usePrefersReducedMotion,
  useIsTouchDevice,
  useBreakpoint,
  useCurrentBreakpoint,
  useOrientation,
} from './useMediaQuery';
export { useClickOutside, useClickOutsideMultiple, useClickOutsideWithEscape } from './useClickOutside';
export {
  useWindowSize,
  useWindowSizeDebounced,
  useScrollPosition,
  useScrollDirection,
  useScrollToBottom,
  useIsScrolledToTop,
  useLockScroll,
} from './useWindowSize';
export {
  useIntersectionObserver,
  useIsVisible,
  useIsVisibleOnce,
  useInfiniteScroll,
  useLazyLoad,
  useScrollProgress,
  useMultipleIntersection,
} from './useIntersectionObserver';
export {
  usePrevious,
  usePreviousWithComparison,
  useIsFirstRender,
  useIsMounted,
  useUpdateEffect,
  useValueHistory,
  useCounter,
  useToggle,
  useArray,
  useMap,
} from './usePrevious';
