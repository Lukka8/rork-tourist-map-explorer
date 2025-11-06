import { Hono } from 'hono';
import { trpcServer } from '@hono/trpc-server';
import { appRouter } from '@/backend/trpc/app-router';
import { createContext } from '@/backend/trpc/create-context';
import { NYC_ATTRACTIONS, TBILISI_ATTRACTIONS, type Attraction } from '@/constants/attractions';

type User = {
  id: number;
  email: string;
  username: string;
  firstname: string;
  lastname: string;
  phone: string;
  email_verified: boolean;
  phone_verified: boolean;
  password?: string;
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

type VerificationRow = {
  id: number;
  user_id: number;
  type: 'email' | 'phone';
  code: string;
  expires_at: string;
  verified: boolean;
  created_at: string;
};

const app = new Hono();

const db = {
  users: [] as User[],
  favorites: new Map<number, Set<string>>(),
  visited: new Map<number, Set<string>>(),
  reviews: [] as Review[],
  verification: [] as VerificationRow[],
  lists: [] as { id: string; user_id: number; name: string; items: string[] }[],
  checkins: [] as { id: string; user_id: number; attractionId: string; photoUri?: string; createdAt: string }[],
};

function ok<T>(c: any, body: T) {
  return c.json(body);
}

function badRequest(c: any, message: string) {
  return c.json({ error: message }, 400);
}

function unauthorized(c: any, message = 'Unauthorized') {
  return c.json({ error: message }, 401);
}

function nowISO() {
  return new Date().toISOString();
}

function createToken(userId: number) {
  return `dev-token-${userId}`;
}

function parseAuth(c: any): number | null {
  const header = c.req.header('authorization') || '';
  const token = header.replace('Bearer ', '');
  if (token.startsWith('dev-token-')) {
    const id = Number(token.replace('dev-token-', ''));
    return Number.isFinite(id) ? id : null;
  }
  return null;
}

app.get('/', (c) => ok(c, { status: 'ok', message: 'API is running' }));

app.post('/api/auth/check-username', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as { username?: string };
  const username = body.username?.trim();
  if (!username) return badRequest(c, 'Missing username');
  const exists = db.users.some((u) => u.username.toLowerCase() === username.toLowerCase());
  return ok(c, { available: !exists });
});

app.post('/api/auth/check-email', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as { email?: string };
  const email = body.email?.trim();
  if (!email) return badRequest(c, 'Missing email');
  const exists = db.users.some((u) => u.email.toLowerCase() === email.toLowerCase());
  return ok(c, { available: !exists });
});

app.post('/api/auth/register', async (c) => {
  const b = (await c.req.json().catch(() => ({}))) as Partial<User> & { password?: string };
  if (!b.email || !b.password || !b.username || !b.firstname || !b.lastname || !b.phone) {
    return badRequest(c, 'Missing required fields');
  }
  if (db.users.some((u) => u.email === b.email || u.username === b.username)) {
    return badRequest(c, 'Email or username already exists');
  }
  const id = db.users.length + 1;
  const user: User = {
    id,
    email: String(b.email),
    username: String(b.username),
    firstname: String(b.firstname),
    lastname: String(b.lastname),
    phone: String(b.phone),
    email_verified: false,
    phone_verified: false,
    password: String(b.password),
  };
  db.users.push(user);
  return ok(c, { token: createToken(id), user: sanitize(user) });
});

app.post('/api/auth/login', async (c) => {
  const b = (await c.req.json().catch(() => ({}))) as { email?: string; password?: string };
  if (!b.email || !b.password) return badRequest(c, 'Missing required fields');
  const u = db.users.find((x) => x.email === b.email);
  if (!u || u.password !== b.password) return unauthorized(c, 'Invalid credentials');
  return ok(c, { token: createToken(u.id), user: sanitize(u) });
});

app.get('/api/auth/me', (c) => {
  const userId = parseAuth(c);
  if (!userId) return unauthorized(c);
  const u = db.users.find((x) => x.id === userId);
  if (!u) return c.json({ error: 'User not found' }, 404);
  return ok(c, sanitize(u));
});

app.post('/api/auth/update-email', async (c) => {
  const userId = parseAuth(c);
  if (!userId) return unauthorized(c);
  const { email } = (await c.req.json().catch(() => ({}))) as { email?: string };
  if (!email) return badRequest(c, 'Missing email');
  if (db.users.some((u) => u.email === email && u.id !== userId)) return badRequest(c, 'Email already in use');
  const u = db.users.find((x) => x.id === userId)!;
  u.email = email;
  u.email_verified = false;
  return ok(c, { success: true, message: 'Email updated. Please verify.', user: sanitize(u) });
});

app.post('/api/auth/update-phone', async (c) => {
  const userId = parseAuth(c);
  if (!userId) return unauthorized(c);
  const { phone } = (await c.req.json().catch(() => ({}))) as { phone?: string };
  if (!phone) return badRequest(c, 'Missing phone');
  if (db.users.some((u) => u.phone === phone && u.id !== userId)) return badRequest(c, 'Phone already in use');
  const u = db.users.find((x) => x.id === userId)!;
  u.phone = phone;
  u.phone_verified = false;
  return ok(c, { success: true, message: 'Phone updated. Please verify.', user: sanitize(u) });
});

app.post('/api/verification/send-email-code', (c) => {
  const userId = parseAuth(c);
  if (!userId) return unauthorized(c);
  const code = genCode();
  addCode(userId, 'email', code);
  console.log('[Verification] Email code (dev):', code);
  return ok(c, { success: true, message: 'Verification code sent' });
});

app.post('/api/verification/send-phone-code', (c) => {
  const userId = parseAuth(c);
  if (!userId) return unauthorized(c);
  const code = genCode();
  addCode(userId, 'phone', code);
  console.log('[Verification] Phone code (dev):', code);
  return ok(c, { success: true, message: 'Verification code sent' });
});

app.post('/api/verification/verify-email', async (c) => {
  const userId = parseAuth(c);
  if (!userId) return unauthorized(c);
  const { code } = (await c.req.json().catch(() => ({}))) as { code?: string };
  if (!code || code.length !== 6) return badRequest(c, 'Invalid code');
  const row = latestCode(userId, 'email', code);
  if (!row) return badRequest(c, 'Code not found');
  if (new Date(row.expires_at).getTime() < Date.now()) return badRequest(c, 'Code expired');
  row.verified = true;
  const u = db.users.find((x) => x.id === userId)!;
  u.email_verified = true;
  return ok(c, { success: true, message: 'Email verified' });
});

app.post('/api/verification/verify-phone', async (c) => {
  const userId = parseAuth(c);
  if (!userId) return unauthorized(c);
  const { code } = (await c.req.json().catch(() => ({}))) as { code?: string };
  if (!code || code.length !== 6) return badRequest(c, 'Invalid code');
  const row = latestCode(userId, 'phone', code);
  if (!row) return badRequest(c, 'Code not found');
  if (new Date(row.expires_at).getTime() < Date.now()) return badRequest(c, 'Code expired');
  row.verified = true;
  const u = db.users.find((x) => x.id === userId)!;
  u.phone_verified = true;
  return ok(c, { success: true, message: 'Phone verified' });
});

app.post('/api/favorites/add', async (c) => {
  const userId = parseAuth(c);
  if (!userId) return unauthorized(c);
  const { attractionId } = (await c.req.json().catch(() => ({}))) as { attractionId?: string };
  if (!attractionId) return badRequest(c, 'Missing attractionId');
  const set = db.favorites.get(userId) ?? new Set<string>();
  set.add(String(attractionId));
  db.favorites.set(userId, set);
  return ok(c, { success: true });
});

app.post('/api/favorites/remove', async (c) => {
  const userId = parseAuth(c);
  if (!userId) return unauthorized(c);
  const { attractionId } = (await c.req.json().catch(() => ({}))) as { attractionId?: string };
  if (!attractionId) return badRequest(c, 'Missing attractionId');
  const set = db.favorites.get(userId) ?? new Set<string>();
  set.delete(String(attractionId));
  db.favorites.set(userId, set);
  return ok(c, { success: true });
});

app.get('/api/favorites/list', (c) => {
  const userId = parseAuth(c);
  if (!userId) return unauthorized(c);
  return ok(c, Array.from(db.favorites.get(userId) ?? new Set()));
});

app.post('/api/visited/add', async (c) => {
  const userId = parseAuth(c);
  if (!userId) return unauthorized(c);
  const { attractionId } = (await c.req.json().catch(() => ({}))) as { attractionId?: string };
  if (!attractionId) return badRequest(c, 'Missing attractionId');
  const set = db.visited.get(userId) ?? new Set<string>();
  set.add(String(attractionId));
  db.visited.set(userId, set);
  return ok(c, { success: true });
});

app.get('/api/visited/list', (c) => {
  const userId = parseAuth(c);
  if (!userId) return unauthorized(c);
  return ok(c, Array.from(db.visited.get(userId) ?? new Set()));
});

app.post('/api/reviews/add', async (c) => {
  const userId = parseAuth(c);
  if (!userId) return unauthorized(c);
  const { attractionId, rating, comment } = (await c.req.json().catch(() => ({}))) as { attractionId?: string; rating?: number; comment?: string };
  if (!attractionId || rating == null) return badRequest(c, 'Missing required fields');
  const u = db.users.find((x) => x.id === userId);
  const id = db.reviews.length + 1;
  db.reviews.unshift({ id, user_id: userId, attraction_id: String(attractionId), rating: Number(rating), comment: comment ?? null, created_at: nowISO(), user_name: u?.username ?? 'user' });
  return ok(c, { success: true, reviewId: id });
});

app.get('/api/reviews/list/:attractionId', (c) => {
  const { attractionId } = c.req.param();
  const list = db.reviews.filter((r) => r.attraction_id === String(attractionId));
  return ok(c, list);
});

app.post('/api/lists/create', async (c) => {
  const userId = parseAuth(c);
  if (!userId) return unauthorized(c);
  const { name } = (await c.req.json().catch(() => ({}))) as { name?: string };
  const id = `list_${Date.now()}`;
  db.lists.unshift({ id, user_id: userId, name: name ?? 'New List', items: [] });
  return ok(c, { id, name: name ?? 'New List' });
});

app.post('/api/lists/rename', async (c) => {
  const userId = parseAuth(c);
  if (!userId) return unauthorized(c);
  const { id, name } = (await c.req.json().catch(() => ({}))) as { id?: string; name?: string };
  const li = db.lists.find((l) => l.user_id === userId && l.id === id);
  if (!li) return c.json({ error: 'List not found' }, 404);
  li.name = name ?? li.name;
  return ok(c, { success: true });
});

app.post('/api/lists/remove', async (c) => {
  const userId = parseAuth(c);
  if (!userId) return unauthorized(c);
  const { id } = (await c.req.json().catch(() => ({}))) as { id?: string };
  const before = db.lists.length;
  db.lists = db.lists.filter((l) => !(l.user_id === userId && l.id === id));
  return ok(c, { success: before !== db.lists.length });
});

app.post('/api/lists/add-item', async (c) => {
  const userId = parseAuth(c);
  if (!userId) return unauthorized(c);
  const { listId, attractionId } = (await c.req.json().catch(() => ({}))) as { listId?: string; attractionId?: string };
  const li = db.lists.find((l) => l.user_id === userId && l.id === listId);
  if (!li) return c.json({ error: 'List not found' }, 404);
  li.items = Array.from(new Set([...(li.items || []), String(attractionId ?? '')]));
  return ok(c, { success: true });
});

app.post('/api/lists/remove-item', async (c) => {
  const userId = parseAuth(c);
  if (!userId) return unauthorized(c);
  const { listId, attractionId } = (await c.req.json().catch(() => ({}))) as { listId?: string; attractionId?: string };
  const li = db.lists.find((l) => l.user_id === userId && l.id === listId);
  if (!li) return c.json({ error: 'List not found' }, 404);
  li.items = (li.items || []).filter((x) => x !== String(attractionId ?? ''));
  return ok(c, { success: true });
});

app.get('/api/lists', (c) => {
  const userId = parseAuth(c);
  if (!userId) return unauthorized(c);
  return ok(c, db.lists.filter((l) => l.user_id === userId));
});

app.post('/api/checkins/create', async (c) => {
  const userId = parseAuth(c);
  if (!userId) return unauthorized(c);
  const { attractionId, photoUri } = (await c.req.json().catch(() => ({}))) as { attractionId?: string; photoUri?: string };
  const id = `chk_${Date.now()}`;
  db.checkins.unshift({ id, user_id: userId, attractionId: String(attractionId ?? ''), photoUri, createdAt: nowISO() });
  return ok(c, { success: true, checkinId: id });
});

app.get('/api/checkins/list', (c) => {
  const userId = parseAuth(c);
  if (!userId) return unauthorized(c);
  return ok(c, db.checkins.filter((x) => x.user_id === userId));
});

app.get('/api/feed', (c) => {
  const friends = [
    { id: 'u1', name: 'Alice', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200' },
    { id: 'u2', name: 'Bob', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200' },
    { id: 'u3', name: 'Charlie', avatarUrl: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=200' },
  ];
  const feed = db.checkins.slice(0, 20).map((it, idx) => ({ id: `feed_${it.id}`, user: friends[idx % friends.length], attractionId: it.attractionId, photoUri: it.photoUri, createdAt: it.createdAt }));
  return ok(c, feed);
});

app.post('/api/locations/search', async (c) => {
  const { bounds, limit, zoom } = (await c.req.json().catch(() => ({}))) as { bounds?: { north: number; south: number; east: number; west: number }; limit?: number; zoom?: number };
  const all: Attraction[] = [...NYC_ATTRACTIONS, ...TBILISI_ATTRACTIONS];
  const b = bounds ?? { north: 90, south: -90, east: 180, west: -180 };
  const filtered = all.filter((a) => {
    const lat = a.coordinate.latitude;
    const lon = a.coordinate.longitude;
    const inLat = lat <= b.north && lat >= b.south;
    const crossesIDL = b.west > b.east;
    const inLon = crossesIDL ? lon >= b.west || lon <= b.east : lon >= b.west && lon <= b.east;
    return inLat && inLon;
  });
  const densityFactor = Math.max(1, Math.round(12 - Math.min(zoom ?? 12, 12)));
  const decimated = filtered.filter((_, idx) => idx % densityFactor === 0).slice(0, (limit ?? 200));
  return ok(c, { items: decimated, total: filtered.length });
});

function genCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function addCode(userId: number, type: 'email' | 'phone', code: string) {
  db.verification = db.verification.filter((v) => !(v.user_id === userId && v.type === type && !v.verified));
  db.verification.push({ id: db.verification.length + 1, user_id: userId, type, code, expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), verified: false, created_at: nowISO() });
}

function latestCode(userId: number, type: 'email' | 'phone', code: string) {
  return db.verification
    .filter((v) => v.user_id === userId && v.type === type && v.code === code)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))[0];
}

function sanitize(u: User) {
  const { password: _pw, ...rest } = u;
  return { ...rest };
}

app.use('/api/trpc/*', trpcServer({ router: appRouter, createContext }));

export default app;
