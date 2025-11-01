import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
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
const USER_KEY = '@user_data';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      console.log('[Auth] Fetching user from storage');
      const userDataString = await AsyncStorage.getItem(USER_KEY);
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        console.log('[Auth] User loaded successfully:', userData.email);
        setUser(userData);
      }
    } catch (error) {
      console.error('[Auth] Error fetching user:', error);
      setToken(null);
      setUser(null);
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
      throw error;
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
          await fetchUser();
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

  const login = async (email: string, password: string) => {
    try {
      console.log('[Auth] Attempting login for:', email);
      
      const mockUser: User = {
        id: 1,
        username: email.split('@')[0],
        firstname: 'Demo',
        lastname: 'User',
        email: email,
        phone: '+1234567890',
        email_verified: true,
        phone_verified: true,
      };
      
      const mockToken = 'mock-token-' + Date.now();
      
      console.log('[Auth] Login successful');
      await AsyncStorage.setItem(TOKEN_KEY, mockToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(mockUser));
      setToken(mockToken);
      setUser(mockUser);
    } catch (error) {
      console.error('[Auth] Login error:', error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      console.log('[Auth] Attempting registration for:', data.email);
      
      const mockUser: User = {
        id: Date.now(),
        username: data.username,
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        phone: data.phone,
        email_verified: false,
        phone_verified: false,
      };
      
      const mockToken = 'mock-token-' + Date.now();
      
      console.log('[Auth] Registration successful');
      await AsyncStorage.setItem(TOKEN_KEY, mockToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(mockUser));
      setToken(mockToken);
      setUser(mockUser);
    } catch (error) {
      console.error('[Auth] Register error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  const value: AuthContextValue = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return value;
});
