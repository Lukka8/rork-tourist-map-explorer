import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import twilio from 'twilio';

const app = express();
app.use(cors());
app.use(express.json());

let pool: mysql.Pool;

async function initDB() {
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
}

initDB();

function authMiddleware(req: Request & { userId?: number }, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here') as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/', (_req: Request, res: Response) => {
  return res.json({ status: 'ok', message: 'API is running' });
});

app.post('/api/auth/check-username', async (req: Request, res: Response) => {
  try {
    const { username } = req.body as { username?: string };
    if (!username) return res.status(400).json({ error: 'Missing username' });
    const [rows] = await pool.query('SELECT id FROM users WHERE username = ? LIMIT 1', [username]);
    return res.json({ available: (rows as any[]).length === 0 });
  } catch (error) {
    console.error('[Auth] Check username error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/check-email', async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email?: string };
    if (!email) return res.status(400).json({ error: 'Missing email' });
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    return res.json({ available: (rows as any[]).length === 0 });
  } catch (error) {
    console.error('[Auth] Check email error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, username, firstname, lastname, phone } = req.body as { email?: string; password?: string; username?: string; firstname?: string; lastname?: string; phone?: string };
    if (!email || !password || !username || !firstname || !lastname || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1', [email, username]);
    if ((existing as any[]).length > 0) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (email, password, username, firstname, lastname, phone, email_verified, phone_verified) VALUES (?, ?, ?, ?, ?, ?, 0, 0)',
      [email, hashedPassword, username, firstname, lastname, phone]
    );
    const token = jwt.sign({ userId: (result as any).insertId }, process.env.JWT_SECRET || 'your_jwt_secret_key_here', { expiresIn: '30d' });
    return res.json({
      token,
      user: { id: (result as any).insertId, email, username, firstname, lastname, phone, email_verified: false, phone_verified: false },
    });
  } catch (error) {
    console.error('[Auth] Register error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) return res.status(400).json({ error: 'Missing required fields' });
    const [users] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    if ((users as any[]).length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = (users as any[])[0];
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'your_jwt_secret_key_here', { expiresIn: '30d' });
    return res.json({ token, user: { id: user.id, email: user.email, username: user.username, firstname: user.firstname, lastname: user.lastname, phone: user.phone, email_verified: !!user.email_verified, phone_verified: !!user.phone_verified } });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req: Request & { userId?: number }, res: Response) => {
  try {
    const [users] = await pool.query('SELECT id, email, username, firstname, lastname, phone, email_verified, phone_verified FROM users WHERE id = ? LIMIT 1', [req.userId]);
    if ((users as any[]).length === 0) return res.status(404).json({ error: 'User not found' });
    const u = (users as any[])[0];
    return res.json({ id: u.id, email: u.email, username: u.username, firstname: u.firstname, lastname: u.lastname, phone: u.phone, email_verified: !!u.email_verified, phone_verified: !!u.phone_verified });
  } catch (error) {
    console.error('[Auth] Me error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/favorites/add', authMiddleware, async (req: Request & { userId?: number }, res: Response) => {
  try {
    const { attractionId } = req.body as { attractionId?: string };
    if (!attractionId) return res.status(400).json({ error: 'Missing attractionId' });
    const [existing] = await pool.query('SELECT id FROM favorites WHERE user_id = ? AND attraction_id = ? LIMIT 1', [req.userId, attractionId]);
    if ((existing as any[]).length > 0) return res.json({ success: true, message: 'Already in favorites' });
    await pool.query('INSERT INTO favorites (user_id, attraction_id) VALUES (?, ?)', [req.userId, attractionId]);
    return res.json({ success: true });
  } catch (error) {
    console.error('[Favorites] Add error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/favorites/remove', authMiddleware, async (req: Request & { userId?: number }, res: Response) => {
  try {
    const { attractionId } = req.body as { attractionId?: string };
    if (!attractionId) return res.status(400).json({ error: 'Missing attractionId' });
    await pool.query('DELETE FROM favorites WHERE user_id = ? AND attraction_id = ?', [req.userId, attractionId]);
    return res.json({ success: true });
  } catch (error) {
    console.error('[Favorites] Remove error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/favorites/list', authMiddleware, async (req: Request & { userId?: number }, res: Response) => {
  try {
    const [favorites] = await pool.query('SELECT attraction_id FROM favorites WHERE user_id = ?', [req.userId]);
    return res.json((favorites as any[]).map((f: any) => f.attraction_id));
  } catch (error) {
    console.error('[Favorites] List error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/visited/add', authMiddleware, async (req: Request & { userId?: number }, res: Response) => {
  try {
    const { attractionId } = req.body as { attractionId?: string };
    if (!attractionId) return res.status(400).json({ error: 'Missing attractionId' });
    const [existing] = await pool.query('SELECT id FROM visited WHERE user_id = ? AND attraction_id = ? LIMIT 1', [req.userId, attractionId]);
    if ((existing as any[]).length > 0) return res.json({ success: true, message: 'Already visited' });
    await pool.query('INSERT INTO visited (user_id, attraction_id, visited_at) VALUES (?, ?, NOW())', [req.userId, attractionId]);
    return res.json({ success: true });
  } catch (error) {
    console.error('[Visited] Add error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/visited/list', authMiddleware, async (req: Request & { userId?: number }, res: Response) => {
  try {
    const [visited] = await pool.query('SELECT attraction_id FROM visited WHERE user_id = ?', [req.userId]);
    return res.json((visited as any[]).map((v: any) => v.attraction_id));
  } catch (error) {
    console.error('[Visited] List error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/reviews/add', authMiddleware, async (req: Request & { userId?: number }, res: Response) => {
  try {
    const { attractionId, rating, comment } = req.body as { attractionId?: string; rating?: number; comment?: string };
    if (!attractionId || !rating) return res.status(400).json({ error: 'Missing required fields' });
    const [result] = await pool.query('INSERT INTO reviews (user_id, attraction_id, rating, comment, created_at) VALUES (?, ?, ?, ?, NOW())', [req.userId, attractionId, rating, comment ?? null]);
    return res.json({ success: true, reviewId: (result as any).insertId });
  } catch (error) {
    console.error('[Reviews] Add error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/reviews/list/:attractionId', async (req: Request, res: Response) => {
  try {
    const { attractionId } = req.params as { attractionId: string };
    const [reviews] = await pool.query(
      `SELECT r.*, u.username as user_name 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.attraction_id = ? 
       ORDER BY r.created_at DESC`,
      [attractionId]
    );
    return res.json(reviews);
  } catch (error) {
    console.error('[Reviews] List error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const hasEmailSender = !!(resend && process.env.RESEND_FROM_EMAIL);
const hasTwilio = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER);
const twilioClient = hasTwilio ? twilio(process.env.TWILIO_ACCOUNT_SID as string, process.env.TWILIO_AUTH_TOKEN as string) : null;

const generateCode = () => String(Math.floor(100000 + Math.random() * 900000));

async function createCode(userId: number, type: string) {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await pool.query('DELETE FROM verification_codes WHERE user_id = ? AND type = ? AND verified = 0', [userId, type]);
  await pool.query('INSERT INTO verification_codes (user_id, type, code, expires_at, verified, created_at) VALUES (?, ?, ?, ?, 0, NOW())', [userId, type, code, expiresAt]);
  return code;
}

app.post('/api/verification/send-email-code', authMiddleware, async (req: Request & { userId?: number }, res: Response) => {
  try {
    const [[user]] = (await pool.query('SELECT email, email_verified FROM users WHERE id = ? LIMIT 1', [req.userId])) as any[];
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.email_verified) return res.json({ success: true, message: 'Email already verified' });
    const code = await createCode(req.userId as number, 'email');
    if (hasEmailSender && resend) {
      try {
        await resend.emails.send({ from: process.env.RESEND_FROM_EMAIL as string, to: user.email, subject: 'Your verification code', text: `Your verification code is ${code}. It expires in 10 minutes.` });
      } catch (e) {
        console.error('[Verification] Resend error:', e);
      }
    } else {
      console.log('[Verification] Email code (dev mode):', code);
    }
    return res.json({ success: true, message: 'Verification code sent' });
  } catch (error) {
    console.error('[Verification] Send email error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/verification/send-phone-code', authMiddleware, async (req: Request & { userId?: number }, res: Response) => {
  try {
    const [[user]] = (await pool.query('SELECT phone, phone_verified FROM users WHERE id = ? LIMIT 1', [req.userId])) as any[];
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.phone_verified) return res.json({ success: true, message: 'Phone already verified' });
    const code = await createCode(req.userId as number, 'phone');
    if (hasTwilio && twilioClient) {
      try {
        await twilioClient.messages.create({ from: process.env.TWILIO_PHONE_NUMBER as string, to: user.phone, body: `Your verification code is ${code}. It expires in 10 minutes.` });
      } catch (e) {
        console.error('[Verification] Twilio error:', e);
      }
    } else {
      console.log('[Verification] Phone code (dev mode):', code);
    }
    return res.json({ success: true, message: 'Verification code sent' });
  } catch (error) {
    console.error('[Verification] Send phone error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/verification/verify-email', authMiddleware, async (req: Request & { userId?: number }, res: Response) => {
  try {
    const { code } = (req.body || {}) as { code?: string };
    if (!code || String(code).length !== 6) return res.status(400).json({ error: 'Invalid code' });
    const [rows] = await pool.query('SELECT id, expires_at, verified FROM verification_codes WHERE user_id = ? AND type = ? AND code = ? ORDER BY created_at DESC LIMIT 1', [req.userId, 'email', String(code)]);
    const list = rows as any[];
    if (list.length === 0) return res.status(400).json({ error: 'Code not found' });
    const row = list[0];
    if (row.verified) return res.status(400).json({ error: 'Code already used' });
    if (new Date(row.expires_at).getTime() < Date.now()) return res.status(400).json({ error: 'Code expired' });
    await pool.query('UPDATE verification_codes SET verified = 1 WHERE id = ?', [row.id]);
    await pool.query('UPDATE users SET email_verified = 1 WHERE id = ?', [req.userId]);
    return res.json({ success: true, message: 'Email verified' });
  } catch (error) {
    console.error('[Verification] Verify email error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/verification/verify-phone', authMiddleware, async (req: Request & { userId?: number }, res: Response) => {
  try {
    const { code } = (req.body || {}) as { code?: string };
    if (!code || String(code).length !== 6) return res.status(400).json({ error: 'Invalid code' });
    const [rows] = await pool.query('SELECT id, expires_at, verified FROM verification_codes WHERE user_id = ? AND type = ? AND code = ? ORDER BY created_at DESC LIMIT 1', [req.userId, 'phone', String(code)]);
    const list = rows as any[];
    if (list.length === 0) return res.status(400).json({ error: 'Code not found' });
    const row = list[0];
    if (row.verified) return res.status(400).json({ error: 'Code already used' });
    if (new Date(row.expires_at).getTime() < Date.now()) return res.status(400).json({ error: 'Code expired' });
    await pool.query('UPDATE verification_codes SET verified = 1 WHERE id = ?', [row.id]);
    await pool.query('UPDATE users SET phone_verified = 1 WHERE id = ?', [req.userId]);
    return res.json({ success: true, message: 'Phone verified' });
  } catch (error) {
    console.error('[Verification] Verify phone error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/update-email', authMiddleware, async (req: Request & { userId?: number }, res: Response) => {
  try {
    const { email } = (req.body || {}) as { email?: string };
    if (!email) return res.status(400).json({ error: 'Missing email' });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email))) return res.status(400).json({ error: 'Invalid email' });
    const [current] = await pool.query('SELECT id FROM users WHERE id = ? LIMIT 1', [req.userId]);
    if ((current as any[]).length === 0) return res.status(404).json({ error: 'User not found' });
    const [dupes] = await pool.query('SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1', [email, req.userId]);
    if ((dupes as any[]).length > 0) return res.status(400).json({ error: 'Email already in use' });
    await pool.query('UPDATE users SET email = ?, email_verified = 0 WHERE id = ?', [email, req.userId]);
    await pool.query('DELETE FROM verification_codes WHERE user_id = ? AND type = ? AND verified = 0', [req.userId, 'email']);
    try {
      const code = await createCode(req.userId as number, 'email');
      if (hasEmailSender && resend) {
        await resend.emails.send({ from: process.env.RESEND_FROM_EMAIL as string, to: email, subject: 'Your verification code', text: `Your verification code is ${code}. It expires in 10 minutes.` });
      } else {
        console.log('[Verification] Email code (dev mode):', code);
      }
    } catch (e) {
      console.error('[Auth] update-email send code error:', e);
    }
    const [updatedRows] = await pool.query('SELECT id, email, username, firstname, lastname, phone, email_verified, phone_verified FROM users WHERE id = ? LIMIT 1', [req.userId]);
    const updated = (updatedRows as any[])[0];
    return res.json({ success: true, message: 'Email updated. Please verify.', user: { ...updated, email_verified: !!updated.email_verified, phone_verified: !!updated.phone_verified } });
  } catch (error) {
    console.error('[Auth] Update email error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/update-phone', authMiddleware, async (req: Request & { userId?: number }, res: Response) => {
  try {
    const { phone } = (req.body || {}) as { phone?: string };
    if (!phone) return res.status(400).json({ error: 'Missing phone' });
    const [current] = await pool.query('SELECT id FROM users WHERE id = ? LIMIT 1', [req.userId]);
    if ((current as any[]).length === 0) return res.status(404).json({ error: 'User not found' });
    const [dupes] = await pool.query('SELECT id FROM users WHERE phone = ? AND id <> ? LIMIT 1', [phone, req.userId]);
    if ((dupes as any[]).length > 0) return res.status(400).json({ error: 'Phone already in use' });
    await pool.query('UPDATE users SET phone = ?, phone_verified = 0 WHERE id = ?', [phone, req.userId]);
    await pool.query('DELETE FROM verification_codes WHERE user_id = ? AND type = ? AND verified = 0', [req.userId, 'phone']);
    try {
      const code = await createCode(req.userId as number, 'phone');
      if (hasTwilio && twilioClient) {
        await twilioClient.messages.create({ from: process.env.TWILIO_PHONE_NUMBER as string, to: phone, body: `Your verification code is ${code}. It expires in 10 minutes.` });
      } else {
        console.log('[Verification] Phone code (dev mode):', code);
      }
    } catch (e) {
      console.error('[Auth] update-phone send code error:', e);
    }
    const [updatedRows] = await pool.query('SELECT id, email, username, firstname, lastname, phone, email_verified, phone_verified FROM users WHERE id = ? LIMIT 1', [req.userId]);
    const updated = (updatedRows as any[])[0];
    return res.json({ success: true, message: 'Phone updated. Please verify.', user: { ...updated, email_verified: !!updated.email_verified, phone_verified: !!updated.phone_verified } });
  } catch (error) {
    console.error('[Auth] Update phone error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default app;
