import AsyncStorage from '@react-native-async-storage/async-storage';

const getBaseUrl = () => {
  const baseUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  console.log('[API] Base URL:', baseUrl);
  
  if (!baseUrl) {
    throw new Error('No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL');
  }
  
  return baseUrl;
};

const baseUrl = getBaseUrl();

async function apiFetch<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await AsyncStorage.getItem('@auth_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }
  
  if (options.headers) {
    Object.assign(headers, options.headers);
  }
  
  console.log('[API] Fetching:', `${baseUrl}${endpoint}`);
  
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });
  
  console.log('[API] Response status:', response.status);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

export const api = {
  auth: {
    register: (data: { username: string; firstname: string; lastname: string; email: string; phone: string; password: string }) =>
      apiFetch<{ token: string; user: { id: number; username: string; firstname: string; lastname: string; email: string; phone: string; email_verified: boolean; phone_verified: boolean } }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    login: (data: { email: string; password: string }) =>
      apiFetch<{ token: string; user: { id: number; username: string; firstname: string; lastname: string; email: string; phone: string; email_verified: boolean; phone_verified: boolean } }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    me: () =>
      apiFetch<{ id: number; username: string; firstname: string; lastname: string; email: string; phone: string; email_verified: boolean; phone_verified: boolean }>('/api/auth/me'),

    checkUsername: (username: string) =>
      apiFetch<{ available: boolean }>('/api/auth/check-username', {
        method: 'POST',
        body: JSON.stringify({ username }),
      }),

    checkEmail: (email: string) =>
      apiFetch<{ available: boolean }>('/api/auth/check-email', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),

    updateEmail: (email: string) =>
      apiFetch<{ success: boolean; message: string; user: { id: number; username: string; firstname: string; lastname: string; email: string; phone: string; email_verified: boolean; phone_verified: boolean } }>(
        '/api/auth/update-email',
        {
          method: 'POST',
          body: JSON.stringify({ email }),
        }
      ),

    updatePhone: (phone: string) =>
      apiFetch<{ success: boolean; message: string; user: { id: number; username: string; firstname: string; lastname: string; email: string; phone: string; email_verified: boolean; phone_verified: boolean } }>(
        '/api/auth/update-phone',
        {
          method: 'POST',
          body: JSON.stringify({ phone }),
        }
      ),
  },
  
  favorites: {
    add: (attractionId: string) =>
      apiFetch<{ success: boolean }>('/api/favorites/add', {
        method: 'POST',
        body: JSON.stringify({ attractionId }),
      }),
    
    remove: (attractionId: string) =>
      apiFetch<{ success: boolean }>('/api/favorites/remove', {
        method: 'POST',
        body: JSON.stringify({ attractionId }),
      }),
    
    list: () =>
      apiFetch<string[]>('/api/favorites/list'),
  },
  
  visited: {
    add: (attractionId: string) =>
      apiFetch<{ success: boolean }>('/api/visited/add', {
        method: 'POST',
        body: JSON.stringify({ attractionId }),
      }),
    
    list: () =>
      apiFetch<string[]>('/api/visited/list'),
  },
  
  reviews: {
    add: (data: { attractionId: string; rating: number; comment?: string }) =>
      apiFetch<{ success: boolean; reviewId: number }>('/api/reviews/add', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    list: (attractionId: string) =>
      apiFetch<{
        id: number;
        user_id: number;
        attraction_id: string;
        rating: number;
        comment: string | null;
        created_at: string;
        user_name: string;
      }[]>(`/api/reviews/list/${attractionId}`),
  },
  
  verification: {
    sendEmailCode: () =>
      apiFetch<{ success: boolean; message: string }>('/api/verification/send-email-code', {
        method: 'POST',
      }),
    
    sendPhoneCode: (_phone: string) =>
      apiFetch<{ success: boolean; message: string }>('/api/verification/send-phone-code', {
        method: 'POST',
      }),
    
    verifyEmail: (code: string) =>
      apiFetch<{ success: boolean; message: string }>('/api/verification/verify-email', {
        method: 'POST',
        body: JSON.stringify({ code }),
      }),
    
    verifyPhone: (code: string) =>
      apiFetch<{ success: boolean; message: string }>('/api/verification/verify-phone', {
        method: 'POST',
        body: JSON.stringify({ code }),
      }),
  },
};
