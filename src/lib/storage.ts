import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { AnalysisResult, AnalysisHistory, UserSettings } from '@/types';

interface SourcingDB extends DBSchema {
  analyses: {
    key: string;
    value: AnalysisResult;
    indexes: { 'by-date': string };
  };
  history: {
    key: string;
    value: AnalysisHistory;
  };
  settings: {
    key: string;
    value: UserSettings;
  };
}

let dbInstance: IDBPDatabase<SourcingDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<SourcingDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<SourcingDB>('sourcing-assistant', 1, {
    upgrade(db) {
      const analysisStore = db.createObjectStore('analyses', { keyPath: 'id' });
      analysisStore.createIndex('by-date', 'createdAt');

      db.createObjectStore('history', { keyPath: 'id' });
      db.createObjectStore('settings', { keyPath: 'id' });
    },
  });

  return dbInstance;
}

// Analysis CRUD
export async function saveAnalysis(analysis: AnalysisResult): Promise<void> {
  const db = await getDB();
  await db.put('analyses', analysis);
}

export async function getAnalysis(id: string): Promise<AnalysisResult | undefined> {
  const db = await getDB();
  return db.get('analyses', id);
}

export async function getAllAnalyses(): Promise<AnalysisResult[]> {
  const db = await getDB();
  return db.getAllFromIndex('analyses', 'by-date');
}

export async function deleteAnalysis(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('analyses', id);
}

// History CRUD
export async function saveHistory(history: AnalysisHistory): Promise<void> {
  const db = await getDB();
  await db.put('history', history);
}

export async function getHistory(id: string): Promise<AnalysisHistory | undefined> {
  const db = await getDB();
  return db.get('history', id);
}

export async function getAllHistory(): Promise<AnalysisHistory[]> {
  const db = await getDB();
  return db.getAll('history');
}

// Settings
export async function saveSettings(settings: UserSettings): Promise<void> {
  const db = await getDB();
  await db.put('settings', { ...settings, id: 'user-settings' } as UserSettings & { id: string });
}

export async function getSettings(): Promise<UserSettings | undefined> {
  const db = await getDB();
  const result = await db.get('settings', 'user-settings');
  return result;
}
