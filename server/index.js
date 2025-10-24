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
      queueLimit: 0
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

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.query(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name]
    );
    
    const token = jwt.sign(
      { userId: result.insertId },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.json({
      token,
      user: {
        id: result.insertId,
        email,
        name
      }
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
    
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, email, name, phone, email_verified, phone_verified FROM users WHERE id = ?',
      [req.userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(users[0]);
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
      'SELECT id FROM favorites WHERE user_id = ? AND attraction_id = ?',
      [req.userId, attractionId]
    );
    
    if (existing.length > 0) {
      return res.json({ success: true, message: 'Already in favorites' });
    }
    
    await pool.query(
      'INSERT INTO favorites (user_id, attraction_id) VALUES (?, ?)',
      [req.userId, attractionId]
    );
    
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
    
    await pool.query(
      'DELETE FROM favorites WHERE user_id = ? AND attraction_id = ?',
      [req.userId, attractionId]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('[Favorites] Remove error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/favorites/list', authMiddleware, async (req, res) => {
  try {
    const [favorites] = await pool.query(
      'SELECT attraction_id FROM favorites WHERE user_id = ?',
      [req.userId]
    );
    
    res.json(favorites.map(f => f.attraction_id));
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
      'SELECT id FROM visited WHERE user_id = ? AND attraction_id = ?',
      [req.userId, attractionId]
    );
    
    if (existing.length > 0) {
      return res.json({ success: true, message: 'Already visited' });
    }
    
    await pool.query(
      'INSERT INTO visited (user_id, attraction_id, visited_at) VALUES (?, ?, NOW())',
      [req.userId, attractionId]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('[Visited] Add error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/visited/list', authMiddleware, async (req, res) => {
  try {
    const [visited] = await pool.query(
      'SELECT attraction_id FROM visited WHERE user_id = ?',
      [req.userId]
    );
    
    res.json(visited.map(v => v.attraction_id));
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
      `SELECT r.*, u.name as user_name 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.attraction_id = ? 
       ORDER BY r.created_at DESC`,
      [attractionId]
    );
    
    res.json(reviews);
  } catch (error) {
    console.error('[Reviews] List error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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
