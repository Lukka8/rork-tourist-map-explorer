import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, usePathname, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useMemo, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Platform, View, Text } from "react-native";

import { AuthProvider, useAuth } from "@/lib/auth-context";
import { SocialProvider } from "@/lib/social-context";

if (Platform.OS === 'web') {
  try {
    require('maplibre-gl/dist/maplibre-gl.css');
  } catch (e) {
    console.log('Could not load maplibre css', e);
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="verify" options={{ headerShown: false }} />
    </Stack>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const requiresVerification = useMemo(() => {
    if (!user) return false;
    return !(user.email_verified && user.phone_verified);
  }, [user]);

  useEffect(() => {
    if (!isLoading) {
      if (!user && pathname !== '/login' && pathname !== '/register') {
        router.replace('/login');
      } else if (user && requiresVerification && pathname !== '/verify') {
        router.replace('/verify');
      }
    }
  }, [isLoading, user, requiresVerification, pathname]);

  if (isLoading) return null;
  if (!user && pathname !== '/login' && pathname !== '/register') return null;
  if (user && requiresVerification && pathname !== '/verify') return null;

  return <>{children}</>;
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const prepare = async () => {
      try {
        console.log('[RootLayout] Starting app initialization...');
        await SplashScreen.preventAutoHideAsync();
        console.log('[RootLayout] Splash screen prevented from hiding');
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('[RootLayout] App ready, hiding splash screen');
        await SplashScreen.hideAsync();
        setIsReady(true);
      } catch (e) {
        console.error('[RootLayout] Error during initialization:', e);
        setError(e instanceof Error ? e.message : 'Unknown error');
        setIsReady(true);
      }
    };

    prepare();
  }, []);

  if (!isReady) {
    return null;
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Initialization Error</Text>
        <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
      </View>
    );
  }

  return (
    
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SocialProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <AuthGate>
                <RootLayoutNav />
              </AuthGate>
            </GestureHandlerRootView>
          </SocialProvider>
        </AuthProvider>
      </QueryClientProvider>
  );
}
