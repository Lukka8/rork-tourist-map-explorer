import React from "react";
import { useQuery, useMutation, UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import { api } from "./api-client";

// Lightweight compatibility shim for legacy trpc.*.useQuery/useMutation calls.
// This maps to our REST api client under the hood to avoid runtime crashes while migrating.
// Remove this file once all usages are updated to api + react-query directly.

type EnabledOpt = { enabled?: boolean };

function useFavoritesList(options?: EnabledOpt & Partial<UseQueryOptions<string[]>>) {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: () => api.favorites.list(),
    enabled: options?.enabled ?? true,
  });
}

function useVisitedList(options?: EnabledOpt & Partial<UseQueryOptions<string[]>>) {
  return useQuery({
    queryKey: ["visited"],
    queryFn: () => api.visited.list(),
    enabled: options?.enabled ?? true,
  });
}

function useFavoriteAdd(options?: UseMutationOptions<{ success: boolean }, Error, string>) {
  return useMutation({ mutationFn: (id: string) => api.favorites.add(id), ...options });
}

function useFavoriteRemove(options?: UseMutationOptions<{ success: boolean }, Error, string>) {
  return useMutation({ mutationFn: (id: string) => api.favorites.remove(id), ...options });
}

function useVisitedAdd(options?: UseMutationOptions<{ success: boolean }, Error, string>) {
  return useMutation({ mutationFn: (id: string) => api.visited.add(id), ...options });
}

export const trpc = {
  Provider: (({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children)) as React.ComponentType<{ children: React.ReactNode }>,
  favorites: {
    list: { useQuery: useFavoritesList },
    add: { useMutation: useFavoriteAdd },
    remove: { useMutation: useFavoriteRemove },
  },
  visited: {
    list: { useQuery: useVisitedList },
    add: { useMutation: useVisitedAdd },
  },
} as const;

export const trpcClient = null as unknown as never;
