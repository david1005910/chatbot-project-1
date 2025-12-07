'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AnalysisResult, AnalysisHistory, UserSettings } from '@/types';

// Hook for managing analysis results
export function useAnalysisStorage() {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalyses = useCallback(async () => {
    try {
      const { getAllAnalyses } = await import('@/lib/storage');
      const data = await getAllAnalyses();
      setAnalyses(data.reverse());
    } catch (error) {
      console.error('Failed to load analyses:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveAnalysis = useCallback(async (analysis: AnalysisResult) => {
    try {
      const { saveAnalysis: save } = await import('@/lib/storage');
      await save(analysis);
      setAnalyses((prev) => [analysis, ...prev]);
    } catch (error) {
      console.error('Failed to save analysis:', error);
    }
  }, []);

  const deleteAnalysis = useCallback(async (id: string) => {
    try {
      const { deleteAnalysis: remove } = await import('@/lib/storage');
      await remove(id);
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error('Failed to delete analysis:', error);
    }
  }, []);

  useEffect(() => {
    loadAnalyses();
  }, [loadAnalyses]);

  return { analyses, isLoading, saveAnalysis, deleteAnalysis, refresh: loadAnalyses };
}

// Hook for managing user settings
export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    try {
      const { getSettings } = await import('@/lib/storage');
      const data = await getSettings();
      setSettings(data || null);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: UserSettings) => {
    try {
      const { saveSettings } = await import('@/lib/storage');
      await saveSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return { settings, isLoading, updateSettings, refresh: loadSettings };
}

// Hook for managing analysis history
export function useHistoryStorage() {
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    try {
      const { getAllHistory } = await import('@/lib/storage');
      const data = await getAllHistory();
      setHistory(data);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveHistory = useCallback(async (item: AnalysisHistory) => {
    try {
      const { saveHistory: save } = await import('@/lib/storage');
      await save(item);
      setHistory((prev) => [...prev, item]);
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return { history, isLoading, saveHistory, refresh: loadHistory };
}
