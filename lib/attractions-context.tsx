import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@favorites';
const VISITED_KEY = '@visited';

interface AttractionsContextValue {
  favorites: string[];
  visited: string[];
  isLoading: boolean;
  addFavorite: (attractionId: string) => Promise<void>;
  removeFavorite: (attractionId: string) => Promise<void>;
  addVisited: (attractionId: string) => Promise<void>;
  isFavorite: (attractionId: string) => boolean;
  isVisited: (attractionId: string) => boolean;
}

export const [AttractionsProvider, useAttractions] = createContextHook(() => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [visited, setVisited] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [favoritesData, visitedData] = await Promise.all([
          AsyncStorage.getItem(FAVORITES_KEY),
          AsyncStorage.getItem(VISITED_KEY),
        ]);

        if (favoritesData) {
          setFavorites(JSON.parse(favoritesData));
        }
        if (visitedData) {
          setVisited(JSON.parse(visitedData));
        }
      } catch (error) {
        console.error('[Attractions] Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const addFavorite = useCallback(async (attractionId: string) => {
    try {
      const updated = [...favorites, attractionId];
      setFavorites(updated);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('[Attractions] Error adding favorite:', error);
    }
  }, [favorites]);

  const removeFavorite = useCallback(async (attractionId: string) => {
    try {
      const updated = favorites.filter(id => id !== attractionId);
      setFavorites(updated);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('[Attractions] Error removing favorite:', error);
    }
  }, [favorites]);

  const addVisited = useCallback(async (attractionId: string) => {
    try {
      if (visited.includes(attractionId)) return;
      const updated = [...visited, attractionId];
      setVisited(updated);
      await AsyncStorage.setItem(VISITED_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('[Attractions] Error adding visited:', error);
    }
  }, [visited]);

  const isFavorite = useCallback((attractionId: string) => {
    return favorites.includes(attractionId);
  }, [favorites]);

  const isVisited = useCallback((attractionId: string) => {
    return visited.includes(attractionId);
  }, [visited]);

  const value: AttractionsContextValue = {
    favorites,
    visited,
    isLoading,
    addFavorite,
    removeFavorite,
    addVisited,
    isFavorite,
    isVisited,
  };

  return value;
});
