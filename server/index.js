const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv/config');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let pool;

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

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (_error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Username/email availability checks for client-side validation
app.post('/api/auth/check-username', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Missing username' });

    const [rows] = await pool.query('SELECT id FROM users WHERE username = ? LIMIT 1', [username]);
    res.json({ available: rows.length === 0 });
  } catch (error) {
    console.error('[Auth] Check username error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Missing email' });

    const [rows] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    res.json({ available: rows.length === 0 });
  } catch (error) {
    console.error('[Auth] Check email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, username, firstname, lastname, phone } = req.body;

    if (!email || !password || !username || !firstname || !lastname || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1',
      [email, username]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (email, password, username, firstname, lastname, phone, email_verified, phone_verified) VALUES (?, ?, ?, ?, ?, ?, 0, 0)',
      [email, hashedPassword, username, firstname, lastname, phone]
    );

    const token = jwt.sign({ userId: result.insertId }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({
      token,
      user: {
        id: result.insertId,
        email,
        username,
        firstname,
        lastname,
        phone,
        email_verified: 0,
        phone_verified: 0,
      },
    });
  } catch (error) {
    console.error('[Auth] Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, email, username, firstname, lastname, phone, email_verified, phone_verified FROM users WHERE id = ? LIMIT 1',
      [req.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const u = users[0];
    res.json({
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/favorites/add', authMiddleware, async (req, res) => {
  try {
    const { attractionId } = req.body;

    if (!attractionId) {
      return res.status(400).json({ error: 'Missing attractionId' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM favorites WHERE user_id = ? AND attraction_id = ? LIMIT 1',
      [req.userId, attractionId]
    );

    if (existing.length > 0) {
      return res.json({ success: true, message: 'Already in favorites' });
    }

    await pool.query('INSERT INTO favorites (user_id, attraction_id) VALUES (?, ?)', [req.userId, attractionId]);

    res.json({ success: true });
  } catch (error) {
    console.error('[Favorites] Add error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/favorites/remove', authMiddleware, async (req, res) => {
  try {
    const { attractionId } = req.body;

    if (!attractionId) {
      return res.status(400).json({ error: 'Missing attractionId' });
    }

    await pool.query('DELETE FROM favorites WHERE user_id = ? AND attraction_id = ?', [req.userId, attractionId]);

    res.json({ success: true });
  } catch (error) {
    console.error('[Favorites] Remove error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/favorites/list', authMiddleware, async (req, res) => {
  try {
    const [favorites] = await pool.query('SELECT attraction_id FROM favorites WHERE user_id = ?', [req.userId]);

    res.json(favorites.map((f) => f.attraction_id));
  } catch (error) {
    console.error('[Favorites] List error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/visited/add', authMiddleware, async (req, res) => {
  try {
    const { attractionId } = req.body;

    if (!attractionId) {
      return res.status(400).json({ error: 'Missing attractionId' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM visited WHERE user_id = ? AND attraction_id = ? LIMIT 1',
      [req.userId, attractionId]
    );

    if (existing.length > 0) {
      return res.json({ success: true, message: 'Already visited' });
    }

    await pool.query('INSERT INTO visited (user_id, attraction_id, visited_at) VALUES (?, ?, NOW())', [req.userId, attractionId]);

    res.json({ success: true });
  } catch (error) {
    console.error('[Visited] Add error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/visited/list', authMiddleware, async (req, res) => {
  try {
    const [visited] = await pool.query('SELECT attraction_id FROM visited WHERE user_id = ?', [req.userId]);

    res.json(visited.map((v) => v.attraction_id));
  } catch (error) {
    console.error('[Visited] List error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/reviews/add', authMiddleware, async (req, res) => {
  try {
    const { attractionId, rating, comment } = req.body;

    if (!attractionId || !rating) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [result] = await pool.query(
      'INSERT INTO reviews (user_id, attraction_id, rating, comment, created_at) VALUES (?, ?, ?, ?, NOW())',
      [req.userId, attractionId, rating, comment || null]
    );

    res.json({ success: true, reviewId: result.insertId });
  } catch (error) {
    console.error('[Reviews] Add error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/reviews/list/:attractionId', async (req, res) => {
  try {
    const { attractionId } = req.params;

    const [reviews] = await pool.query(
      `SELECT r.*, u.username as user_name \
       FROM reviews r \
       JOIN users u ON r.user_id = u.id \
       WHERE r.attraction_id = ? \
       ORDER BY r.created_at DESC`,
      [attractionId]
    );

    res.json(reviews);
  } catch (error) {
    console.error('[Reviews] List error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verification endpoints (stubs). Wire to email/SMS providers later.
app.post('/api/verification/send-email-code', authMiddleware, async (req, res) => {
  try {
    res.json({ success: true, message: 'Email verification not implemented yet' });
  } catch (error) {
    console.error('[Verification] Send email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/verification/send-phone-code', authMiddleware, async (req, res) => {
  try {
    res.json({ success: true, message: 'Phone verification not implemented yet' });
  } catch (error) {
    console.error('[Verification] Send phone error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/verification/verify-email', authMiddleware, async (req, res) => {
  try {
    res.json({ success: true, message: 'Email verification not implemented yet' });
  } catch (error) {
    console.error('[Verification] Verify email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/verification/verify-phone', authMiddleware, async (req, res) => {
  try {
    res.json({ success: true, message: 'Phone verification not implemented yet' });
  } catch (error) {
    console.error('[Verification] Verify phone error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
  });
});
