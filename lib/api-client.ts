import AsyncStorage from '@react-native-async-storage/async-storage';
import { NYC_ATTRACTIONS, TBILISI_ATTRACTIONS, type Attraction } from '@/constants/attractions';

type User = {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  email_verified: boolean;
  phone_verified: boolean;
};

type Review = {
  id: number;
  user_id: number;
  attraction_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_name: string;
};

const getBaseUrl = () => {
  const baseUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  const useMocks = process.env.EXPO_PUBLIC_USE_MOCKS === '1' || process.env.EXPO_PUBLIC_USE_MOCKS === 'true';
  console.log('[API] Base URL:', baseUrl, 'useMocks:', useMocks);
  return { baseUrl: baseUrl ?? '', useMocks: !baseUrl || useMocks };
};

const { baseUrl, useMocks } = getBaseUrl();

async function apiFetch<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (useMocks) {
    console.log('[API] Mock mode enabled for', endpoint);
    return mockFetch<T>(endpoint, options);
  }

  const token = await AsyncStorage.getItem('@auth_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  if (options.headers) {
    Object.assign(headers, options.headers as Record<string, string>);
  }

  const url = `${baseUrl}${endpoint}`;
  console.log('[API] Fetching:', url);

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err) {
    console.log('[API] Network error, falling back to mock for', endpoint, err);
    return mockFetch<T>(endpoint, options);
  }

  console.log('[API] Response status:', response.status);

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = (errorData as { error?: string; message?: string }).error || (errorData as { error?: string; message?: string }).message || errorMessage;
    } catch (e) {
      console.log('[API] Failed to parse error response:', e);
      const text = await response.text().catch(() => '');
      console.log('[API] Error response text:', text);
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

async function mockFetch<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
  await delay(300);
  const method = (options.method ?? 'GET').toUpperCase();
  const body = parseBody(options.body);
  console.log('[API][MOCK]', method, endpoint, body ?? {});

  // Persisted local mocks for favorites/visited
  const FAVORITES_KEY = '@favorites';
  const VISITED_KEY = '@visited';

  if (endpoint.startsWith('/api/auth/login') && method === 'POST') {
    const user: User = baseUser();
    await AsyncStorage.setItem('@auth_token', 'mock-token');
    return { token: 'mock-token', user } as T;
  }

  if (endpoint.startsWith('/api/auth/register') && method === 'POST') {
    const b = toRecord(body);
    const user: User = { ...baseUser(), email: (b.email as string) ?? 'demo@example.com', username: (b.username as string) ?? 'demo' };
    await AsyncStorage.setItem('@auth_token', 'mock-token');
    return { token: 'mock-token', user } as T;
  }

  if (endpoint.startsWith('/api/auth/me')) {
    return baseUser() as unknown as T;
  }

  if (endpoint.startsWith('/api/auth/check-username') && method === 'POST') {
    const b = toRecord(body);
    const username = (b.username as string) ?? '';
    return { available: username !== 'taken' } as T;
  }

  if (endpoint.startsWith('/api/auth/check-email') && method === 'POST') {
    const b = toRecord(body);
    const email = (b.email as string) ?? '';
    return { available: !email.startsWith('used') } as T;
  }

  if (endpoint.startsWith('/api/auth/update-email') && method === 'POST') {
    const b = toRecord(body);
    const user: User = { ...baseUser(), email: (b.email as string) ?? baseUser().email };
    return { success: true, message: 'Email updated', user } as T;
  }

  if (endpoint.startsWith('/api/auth/update-phone') && method === 'POST') {
    const b = toRecord(body);
    const user: User = { ...baseUser(), phone: (b.phone as string) ?? baseUser().phone };
    return { success: true, message: 'Phone updated', user } as T;
  }

  if (endpoint.startsWith('/api/favorites/add') && method === 'POST') {
    const id = String((body as { attractionId: string }).attractionId);
    const current = await getArray(FAVORITES_KEY);
    if (!current.includes(id)) {
      const updated = [...current, id];
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    }
    return { success: true } as T;
  }

  if (endpoint.startsWith('/api/favorites/remove') && method === 'POST') {
    const id = String((body as { attractionId: string }).attractionId);
    const current = await getArray(FAVORITES_KEY);
    const updated = current.filter((x) => x !== id);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return { success: true } as T;
  }

  if (endpoint.startsWith('/api/favorites/list')) {
    const current = await getArray(FAVORITES_KEY);
    return current as unknown as T;
  }

  if (endpoint.startsWith('/api/visited/add') && method === 'POST') {
    const id = String((body as { attractionId: string }).attractionId);
    const current = await getArray(VISITED_KEY);
    if (!current.includes(id)) {
      const updated = [...current, id];
      await AsyncStorage.setItem(VISITED_KEY, JSON.stringify(updated));
    }
    return { success: true } as T;
  }

  if (endpoint.startsWith('/api/visited/list')) {
    const current = await getArray(VISITED_KEY);
    return current as unknown as T;
  }

  if (endpoint.startsWith('/api/reviews/add') && method === 'POST') {
    return { success: true, reviewId: Math.floor(Math.random() * 100000) } as T;
  }

  if (endpoint.startsWith('/api/reviews/list/')) {
    const now = new Date().toISOString();
    const sample: Review[] = [
      { id: 1, user_id: 1, attraction_id: '1', rating: 5, comment: 'Amazing!', created_at: now, user_name: 'Alice' },
      { id: 2, user_id: 2, attraction_id: '1', rating: 4, comment: 'Great views', created_at: now, user_name: 'Bob' },
    ];
    return sample as unknown as T;
  }

  if (endpoint.startsWith('/api/verification/')) {
    return { success: true, message: 'Mock success' } as T;
  }

  if (endpoint.startsWith('/api/locations/search') && method === 'POST') {
    const b = toRecord(body);
    const bounds = (b.bounds as { north: number; south: number; east: number; west: number }) ?? { north: 90, south: -90, east: 180, west: -180 };
    const limit = Number((b.limit as number) ?? 200);
    const zoom = Number((b.zoom as number) ?? 10);

    const all: Attraction[] = [...NYC_ATTRACTIONS, ...TBILISI_ATTRACTIONS];

    const filtered = all.filter((a) => {
      const lat = a.coordinate.latitude;
      const lon = a.coordinate.longitude;
      const inLat = lat <= bounds.north && lat >= bounds.south;
      const crossesIDL = bounds.west > bounds.east; // handle bounding boxes spanning the antimeridian
      const inLon = crossesIDL ? (lon >= bounds.west || lon <= bounds.east) : (lon >= bounds.west && lon <= bounds.east);
      return inLat && inLon;
    });

    const densityFactor = Math.max(1, Math.round(12 - Math.min(zoom, 12))); // lower zoom => fewer points
    const decimated = filtered.filter((_, idx) => idx % densityFactor === 0).slice(0, limit);

    return { items: decimated, total: filtered.length } as T;
  }

  throw new Error(`No mock handler for ${method} ${endpoint}`);
}

function baseUser(): User {
  return {
    id: 1,
    username: 'demo',
    firstname: 'Demo',
    lastname: 'User',
    email: 'demo@example.com',
    phone: '+10000000000',
    email_verified: true,
    phone_verified: false,
  };
}

function parseBody(body: BodyInit | null | undefined): unknown {
  if (!body) return undefined;
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  }
  return undefined;
}

function toRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') return value as Record<string, unknown>;
  return {};
}

async function getArray(key: string): Promise<string[]> {
  const raw = await AsyncStorage.getItem(key);
  try {
    const arr = raw ? JSON.parse(raw) : [];
    if (Array.isArray(arr)) return arr as string[];
    return [];
  } catch {
    return [];
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

export const api = {
  auth: {
    register: (data: { username: string; firstname: string; lastname: string; email: string; phone: string; password: string }) =>
      apiFetch<{ token: string; user: User }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    login: (data: { email: string; password: string }) =>
      apiFetch<{ token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    me: () => apiFetch<User>('/api/auth/me'),

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
      apiFetch<{ success: boolean; message: string; user: User }>(
        '/api/auth/update-email',
        {
          method: 'POST',
          body: JSON.stringify({ email }),
        }
      ),

    updatePhone: (phone: string) =>
      apiFetch<{ success: boolean; message: string; user: User }>(
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

    list: () => apiFetch<string[]>('/api/favorites/list'),
  },

  visited: {
    add: (attractionId: string) =>
      apiFetch<{ success: boolean }>('/api/visited/add', {
        method: 'POST',
        body: JSON.stringify({ attractionId }),
      }),

    list: () => apiFetch<string[]>('/api/visited/list'),
  },

  reviews: {
    add: (data: { attractionId: string; rating: number; comment?: string }) =>
      apiFetch<{ success: boolean; reviewId: number }>('/api/reviews/add', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    list: (attractionId: string) =>
      apiFetch<Review[]>(`/api/reviews/list/${attractionId}`),
  },

  locations: {
    search: (params: { bounds: { north: number; south: number; east: number; west: number }; zoom?: number; limit?: number }) =>
      apiFetch<{ items: Attraction[]; total: number }>(`/api/locations/search`, {
        method: 'POST',
        body: JSON.stringify(params),
      }),
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

export const isMockApi = useMocks;
