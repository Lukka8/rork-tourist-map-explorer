import { Hono, Context } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = new Hono<{ Variables: Variables }>();

app.use("*", cors());

let pool: mysql.Pool;

const initDB = async () => {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'tourist_map',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    console.log('[DB] Connected to MySQL database');
  } catch (err) {
    console.error('[DB] Connection error:', err);
  }
};

initDB();

app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  })
);

app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

type Variables = {
  userId: number;
};

const authMiddleware = async (c: Context<{ Variables: Variables }>, next: () => Promise<void>) => {
  try {
    const authHeader = c.req.header('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return c.json({ error: 'No token provided' }, 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here') as { userId: number };
    c.set('userId', decoded.userId);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};

app.post('/api/auth/check-username', async (c) => {
  try {
    const { username } = await c.req.json();
    if (!username) return c.json({ error: 'Missing username' }, 400);

    const [rows] = await pool.query('SELECT id FROM users WHERE username = ? LIMIT 1', [username]) as any;
    return c.json({ available: rows.length === 0 });
  } catch (error) {
    console.error('[Auth] Check username error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/auth/check-email', async (c) => {
  try {
    const { email } = await c.req.json();
    if (!email) return c.json({ error: 'Missing email' }, 400);

    const [rows] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]) as any;
    return c.json({ available: rows.length === 0 });
  } catch (error) {
    console.error('[Auth] Check email error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/auth/register', async (c) => {
  try {
    const { email, password, username, firstname, lastname, phone } = await c.req.json();

    if (!email || !password || !username || !firstname || !lastname || !phone) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1',
      [email, username]
    ) as any;

    if (existing.length > 0) {
      return c.json({ error: 'Email or username already exists' }, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (email, password, username, firstname, lastname, phone, email_verified, phone_verified) VALUES (?, ?, ?, ?, ?, ?, 0, 0)',
      [email, hashedPassword, username, firstname, lastname, phone]
    ) as any;

    const token = jwt.sign({ userId: result.insertId }, process.env.JWT_SECRET || 'your_jwt_secret_key_here', {
      expiresIn: '30d',
    });

    return c.json({
      token,
      user: {
        id: result.insertId,
        email,
        username,
        firstname,
        lastname,
        phone,
        email_verified: false,
        phone_verified: false,
      },
    });
  } catch (error) {
    console.error('[Auth] Register error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]) as any;

    if (users.length === 0) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'your_jwt_secret_key_here', {
      expiresIn: '30d',
    });

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        phone: user.phone,
        email_verified: !!user.email_verified,
        phone_verified: !!user.phone_verified,
      },
    });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/api/auth/me', authMiddleware, async (c: Context<{ Variables: Variables }>) => {
  try {
    const userId = c.get('userId');
    const [users] = await pool.query(
      'SELECT id, email, username, firstname, lastname, phone, email_verified, phone_verified FROM users WHERE id = ? LIMIT 1',
      [userId]
    ) as any;

    if (users.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    const u = users[0];
    return c.json({
      id: u.id,
      email: u.email,
      username: u.username,
      firstname: u.firstname,
      lastname: u.lastname,
      phone: u.phone,
      email_verified: !!u.email_verified,
      phone_verified: !!u.phone_verified,
    });
  } catch (error) {
    console.error('[Auth] Me error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/favorites/add', authMiddleware, async (c: Context<{ Variables: Variables }>) => {
  try {
    const userId = c.get('userId');
    const { attractionId } = await c.req.json();

    if (!attractionId) {
      return c.json({ error: 'Missing attractionId' }, 400);
    }

    const [existing] = await pool.query(
      'SELECT id FROM favorites WHERE user_id = ? AND attraction_id = ? LIMIT 1',
      [userId, attractionId]
    ) as any;

    if (existing.length > 0) {
      return c.json({ success: true, message: 'Already in favorites' });
    }

    await pool.query('INSERT INTO favorites (user_id, attraction_id) VALUES (?, ?)', [userId, attractionId]);

    return c.json({ success: true });
  } catch (error) {
    console.error('[Favorites] Add error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/favorites/remove', authMiddleware, async (c: Context<{ Variables: Variables }>) => {
  try {
    const userId = c.get('userId');
    const { attractionId } = await c.req.json();

    if (!attractionId) {
      return c.json({ error: 'Missing attractionId' }, 400);
    }

    await pool.query('DELETE FROM favorites WHERE user_id = ? AND attraction_id = ?', [userId, attractionId]);

    return c.json({ success: true });
  } catch (error) {
    console.error('[Favorites] Remove error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/api/favorites/list', authMiddleware, async (c: Context<{ Variables: Variables }>) => {
  try {
    const userId = c.get('userId');
    const [favorites] = await pool.query('SELECT attraction_id FROM favorites WHERE user_id = ?', [userId]) as any;

    return c.json(favorites.map((f: any) => f.attraction_id));
  } catch (error) {
    console.error('[Favorites] List error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/visited/add', authMiddleware, async (c: Context<{ Variables: Variables }>) => {
  try {
    const userId = c.get('userId');
    const { attractionId } = await c.req.json();

    if (!attractionId) {
      return c.json({ error: 'Missing attractionId' }, 400);
    }

    const [existing] = await pool.query(
      'SELECT id FROM visited WHERE user_id = ? AND attraction_id = ? LIMIT 1',
      [userId, attractionId]
    ) as any;

    if (existing.length > 0) {
      return c.json({ success: true, message: 'Already visited' });
    }

    await pool.query('INSERT INTO visited (user_id, attraction_id, visited_at) VALUES (?, ?, NOW())', [userId, attractionId]);

    return c.json({ success: true });
  } catch (error) {
    console.error('[Visited] Add error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/api/visited/list', authMiddleware, async (c: Context<{ Variables: Variables }>) => {
  try {
    const userId = c.get('userId');
    const [visited] = await pool.query('SELECT attraction_id FROM visited WHERE user_id = ?', [userId]) as any;

    return c.json(visited.map((v: any) => v.attraction_id));
  } catch (error) {
    console.error('[Visited] List error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/reviews/add', authMiddleware, async (c: Context<{ Variables: Variables }>) => {
  try {
    const userId = c.get('userId');
    const { attractionId, rating, comment } = await c.req.json();

    if (!attractionId || !rating) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const [result] = await pool.query(
      'INSERT INTO reviews (user_id, attraction_id, rating, comment, created_at) VALUES (?, ?, ?, ?, NOW())',
      [userId, attractionId, rating, comment || null]
    ) as any;

    return c.json({ success: true, reviewId: result.insertId });
  } catch (error) {
    console.error('[Reviews] Add error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/api/reviews/list/:attractionId', async (c) => {
  try {
    const attractionId = c.req.param('attractionId');

    const [reviews] = await pool.query(
      `SELECT r.*, u.username as user_name 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.attraction_id = ? 
       ORDER BY r.created_at DESC`,
      [attractionId]
    ) as any;

    return c.json(reviews);
  } catch (error) {
    console.error('[Reviews] List error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

const generateCode = () => String(Math.floor(100000 + Math.random() * 900000));

const createCode = async (userId: number, type: string) => {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await pool.query('DELETE FROM verification_codes WHERE user_id = ? AND type = ? AND verified = 0', [userId, type]);
  await pool.query(
    'INSERT INTO verification_codes (user_id, type, code, expires_at, verified, created_at) VALUES (?, ?, ?, ?, 0, NOW())',
    [userId, type, code, expiresAt]
  );
  return code;
};

app.post('/api/verification/send-email-code', authMiddleware, async (c: Context<{ Variables: Variables }>) => {
  try {
    const userId = c.get('userId');
    const [users] = await pool.query('SELECT email, email_verified FROM users WHERE id = ? LIMIT 1', [userId]) as any;
    const user = users[0];
    
    if (!user) return c.json({ error: 'User not found' }, 404);
    if (user.email_verified) return c.json({ success: true, message: 'Email already verified' });

    const code = await createCode(userId, 'email');
    console.log('[Verification] Email code (dev mode):', code);

    return c.json({ success: true, message: 'Verification code sent' });
  } catch (error) {
    console.error('[Verification] Send email error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/verification/send-phone-code', authMiddleware, async (c: Context<{ Variables: Variables }>) => {
  try {
    const userId = c.get('userId');
    const [users] = await pool.query('SELECT phone, phone_verified FROM users WHERE id = ? LIMIT 1', [userId]) as any;
    const user = users[0];
    
    if (!user) return c.json({ error: 'User not found' }, 404);
    if (user.phone_verified) return c.json({ success: true, message: 'Phone already verified' });

    const code = await createCode(userId, 'phone');
    console.log('[Verification] Phone code (dev mode):', code);

    return c.json({ success: true, message: 'Verification code sent' });
  } catch (error) {
    console.error('[Verification] Send phone error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/verification/verify-email', authMiddleware, async (c: Context<{ Variables: Variables }>) => {
  try {
    const userId = c.get('userId');
    const { code } = await c.req.json();
    
    if (!code || String(code).length !== 6) return c.json({ error: 'Invalid code' }, 400);

    const [rows] = await pool.query(
      'SELECT id, expires_at, verified FROM verification_codes WHERE user_id = ? AND type = ? AND code = ? ORDER BY created_at DESC LIMIT 1',
      [userId, 'email', String(code)]
    ) as any;

    if (rows.length === 0) return c.json({ error: 'Code not found' }, 400);

    const row = rows[0];
    if (row.verified) return c.json({ error: 'Code already used' }, 400);
    if (new Date(row.expires_at).getTime() < Date.now()) return c.json({ error: 'Code expired' }, 400);

    await pool.query('UPDATE verification_codes SET verified = 1 WHERE id = ?', [row.id]);
    await pool.query('UPDATE users SET email_verified = 1 WHERE id = ?', [userId]);

    return c.json({ success: true, message: 'Email verified' });
  } catch (error) {
    console.error('[Verification] Verify email error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/verification/verify-phone', authMiddleware, async (c: Context<{ Variables: Variables }>) => {
  try {
    const userId = c.get('userId');
    const { code } = await c.req.json();
    
    if (!code || String(code).length !== 6) return c.json({ error: 'Invalid code' }, 400);

    const [rows] = await pool.query(
      'SELECT id, expires_at, verified FROM verification_codes WHERE user_id = ? AND type = ? AND code = ? ORDER BY created_at DESC LIMIT 1',
      [userId, 'phone', String(code)]
    ) as any;

    if (rows.length === 0) return c.json({ error: 'Code not found' }, 400);

    const row = rows[0];
    if (row.verified) return c.json({ error: 'Code already used' }, 400);
    if (new Date(row.expires_at).getTime() < Date.now()) return c.json({ error: 'Code expired' }, 400);

    await pool.query('UPDATE verification_codes SET verified = 1 WHERE id = ?', [row.id]);
    await pool.query('UPDATE users SET phone_verified = 1 WHERE id = ?', [userId]);

    return c.json({ success: true, message: 'Phone verified' });
  } catch (error) {
    console.error('[Verification] Verify phone error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/auth/update-email', authMiddleware, async (c: Context<{ Variables: Variables }>) => {
  try {
    const userId = c.get('userId');
    const { email } = await c.req.json();
    
    if (!email) return c.json({ error: 'Missing email' }, 400);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email))) return c.json({ error: 'Invalid email' }, 400);

    const [current] = await pool.query('SELECT id FROM users WHERE id = ? LIMIT 1', [userId]) as any;
    if (current.length === 0) return c.json({ error: 'User not found' }, 404);

    const [dupes] = await pool.query('SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1', [email, userId]) as any;
    if (dupes.length > 0) return c.json({ error: 'Email already in use' }, 400);

    await pool.query('UPDATE users SET email = ?, email_verified = 0 WHERE id = ?', [email, userId]);
    await pool.query('DELETE FROM verification_codes WHERE user_id = ? AND type = ? AND verified = 0', [userId, 'email']);

    try {
      const code = await createCode(userId, 'email');
      console.log('[Verification] Email code (dev mode):', code);
    } catch (e) {
      console.error('[Auth] update-email send code error:', e);
    }

    const [updated] = await pool.query('SELECT id, email, username, firstname, lastname, phone, email_verified, phone_verified FROM users WHERE id = ? LIMIT 1', [userId]) as any;
    const user = updated[0];
    
    return c.json({ 
      success: true, 
      message: 'Email updated. Please verify.', 
      user: { 
        ...user, 
        email_verified: !!user.email_verified, 
        phone_verified: !!user.phone_verified 
      } 
    });
  } catch (error) {
    console.error('[Auth] Update email error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/auth/update-phone', authMiddleware, async (c: Context<{ Variables: Variables }>) => {
  try {
    const userId = c.get('userId');
    const { phone } = await c.req.json();
    
    if (!phone) return c.json({ error: 'Missing phone' }, 400);

    const [current] = await pool.query('SELECT id FROM users WHERE id = ? LIMIT 1', [userId]) as any;
    if (current.length === 0) return c.json({ error: 'User not found' }, 404);

    const [dupes] = await pool.query('SELECT id FROM users WHERE phone = ? AND id <> ? LIMIT 1', [phone, userId]) as any;
    if (dupes.length > 0) return c.json({ error: 'Phone already in use' }, 400);

    await pool.query('UPDATE users SET phone = ?, phone_verified = 0 WHERE id = ?', [phone, userId]);
    await pool.query('DELETE FROM verification_codes WHERE user_id = ? AND type = ? AND verified = 0', [userId, 'phone']);

    try {
      const code = await createCode(userId, 'phone');
      console.log('[Verification] Phone code (dev mode):', code);
    } catch (e) {
      console.error('[Auth] update-phone send code error:', e);
    }

    const [updated] = await pool.query('SELECT id, email, username, firstname, lastname, phone, email_verified, phone_verified FROM users WHERE id = ? LIMIT 1', [userId]) as any;
    const user = updated[0];
    
    return c.json({ 
      success: true, 
      message: 'Phone updated. Please verify.', 
      user: { 
        ...user, 
        email_verified: !!user.email_verified, 
        phone_verified: !!user.phone_verified 
      } 
    });
  } catch (error) {
    console.error('[Auth] Update phone error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default app;
