'use client';

import { useState, useCallback } from 'react';

interface UseClipboardOptions {
  timeout?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseClipboardReturn {
  copy: (text: string) => Promise<boolean>;
  copied: boolean;
  error: Error | null;
}

export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const { timeout = 2000, onSuccess, onError } = options;
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      if (!navigator?.clipboard) {
        const error = new Error('Clipboard API not supported');
        setError(error);
        onError?.(error);
        return false;
      }

      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setError(null);
        onSuccess?.();

        setTimeout(() => {
          setCopied(false);
        }, timeout);

        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to copy');
        setError(error);
        setCopied(false);
        onError?.(error);
        return false;
      }
    },
    [timeout, onSuccess, onError]
  );

  return { copy, copied, error };
}

// Utility function for one-off copy operations
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!navigator?.clipboard) {
    console.error('Clipboard API not supported');
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}
