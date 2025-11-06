import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api-client';

export interface SavedList { id: string; name: string; items: string[] }

interface ListsState {
  lists: SavedList[];
  isLoading: boolean;
  createList: (name: string) => Promise<void>;
  renameList: (id: string, name: string) => Promise<void>;
  removeList: (id: string) => Promise<void>;
  addToList: (listId: string, attractionId: string) => Promise<void>;
  removeFromList: (listId: string, attractionId: string) => Promise<void>;
}

export const [ListsProvider, useLists] = createContextHook<ListsState>(() => {
  const [lists, setLists] = useState<SavedList[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    api.lists.all().then((data) => setLists(data)).finally(() => setIsLoading(false));
  }, []);

  const refresh = useCallback(async () => {
    const data = await api.lists.all();
    setLists(data);
  }, []);

  const createList = useCallback(async (name: string) => { await api.lists.create(name); await refresh(); }, [refresh]);
  const renameList = useCallback(async (id: string, name: string) => { await api.lists.rename(id, name); await refresh(); }, [refresh]);
  const removeList = useCallback(async (id: string) => { await api.lists.remove(id); await refresh(); }, [refresh]);
  const addToList = useCallback(async (listId: string, attractionId: string) => { await api.lists.addItem(listId, attractionId); await refresh(); }, [refresh]);
  const removeFromList = useCallback(async (listId: string, attractionId: string) => { await api.lists.removeItem(listId, attractionId); await refresh(); }, [refresh]);

  return useMemo(() => ({ lists, isLoading, createList, renameList, removeList, addToList, removeFromList }), [lists, isLoading, createList, renameList, removeList, addToList, removeFromList]);
});
