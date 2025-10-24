import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trpc, trpcClient } from './trpc';

interface User {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  email_verified: boolean;
  phone_verified: boolean;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

interface RegisterData {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  password: string;
}

const TOKEN_KEY = '@auth_token';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loginMutation = trpc.auth.login.useMutation();
  const registerMutation = trpc.auth.register.useMutation();

  const fetchUser = async (authToken: string) => {
    try {
      console.log('[Auth] Fetching user with token');
      const response = await trpcClient.auth.me.query({ token: authToken });
      console.log('[Auth] User fetched successfully:', response.user.username);
      setUser(response.user);
    } catch (error) {
      console.error('[Auth] Error fetching user:', error);
      setToken(null);
      setUser(null);
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('[Auth] Initializing authentication...');
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        if (storedToken) {
          console.log('[Auth] Found stored token, fetching user');
          setToken(storedToken);
          await fetchUser(storedToken);
        } else {
          console.log('[Auth] No stored token found');
        }
      } catch (error) {
        console.error('[Auth] Error loading token:', error);
      } finally {
        setIsLoading(false);
        console.log('[Auth] Initialization complete');
      }
    };
    
    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      console.log('[Auth] Attempting login for:', username);
      const response = await loginMutation.mutateAsync({ username, password });
      console.log('[Auth] Login successful');
      await AsyncStorage.setItem(TOKEN_KEY, response.token);
      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      console.error('[Auth] Login error:', error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      console.log('[Auth] Attempting registration for:', data.username);
      const response = await registerMutation.mutateAsync(data);
      console.log('[Auth] Registration successful');
      await AsyncStorage.setItem(TOKEN_KEY, response.token);
      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      console.error('[Auth] Register error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextValue = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return value;
});
