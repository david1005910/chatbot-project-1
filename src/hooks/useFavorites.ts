'use client';

import { useState, useEffect, useCallback } from 'react';

interface FavoriteKeyword {
  keyword: string;
  addedAt: string;
  notes?: string;
}

const STORAGE_KEY = 'coupang-sourcing-favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteKeyword[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save favorites to localStorage
  const saveFavorites = useCallback((newFavorites: FavoriteKeyword[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  }, []);

  const addFavorite = useCallback((keyword: string, notes?: string) => {
    if (favorites.some((f) => f.keyword === keyword)) return;

    const newFavorite: FavoriteKeyword = {
      keyword,
      addedAt: new Date().toISOString(),
      notes,
    };

    saveFavorites([...favorites, newFavorite]);
  }, [favorites, saveFavorites]);

  const removeFavorite = useCallback((keyword: string) => {
    saveFavorites(favorites.filter((f) => f.keyword !== keyword));
  }, [favorites, saveFavorites]);

  const toggleFavorite = useCallback((keyword: string, notes?: string) => {
    if (favorites.some((f) => f.keyword === keyword)) {
      removeFavorite(keyword);
    } else {
      addFavorite(keyword, notes);
    }
  }, [favorites, addFavorite, removeFavorite]);

  const isFavorite = useCallback((keyword: string) => {
    return favorites.some((f) => f.keyword === keyword);
  }, [favorites]);

  const updateNotes = useCallback((keyword: string, notes: string) => {
    saveFavorites(
      favorites.map((f) =>
        f.keyword === keyword ? { ...f, notes } : f
      )
    );
  }, [favorites, saveFavorites]);

  return {
    favorites,
    isLoaded,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    updateNotes,
  };
}
