import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const baseUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  console.log('[tRPC] Base URL:', baseUrl);
  
  if (!baseUrl) {
    throw new Error(
      "No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL"
    );
  }
  
  return baseUrl;
};

const baseUrl = getBaseUrl();
const trpcUrl = `${baseUrl}/api/trpc`;
console.log('[tRPC] Full tRPC URL:', trpcUrl);

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: trpcUrl,
      transformer: superjson,
      headers: async () => {
        const token = await AsyncStorage.getItem('@auth_token');
        console.log('[tRPC] Request headers - Has token:', !!token);
        return token ? { authorization: `Bearer ${token}` } : {};
      },
      fetch: async (url, options) => {
        console.log('[tRPC] Fetching:', url);
        try {
          const response = await fetch(url, options);
          console.log('[tRPC] Response status:', response.status);
          return response;
        } catch (error) {
          console.error('[tRPC] Fetch error:', error);
          throw error;
        }
      },
    }),
  ],
});
