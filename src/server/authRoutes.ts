import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db.js';
import crypto from 'crypto';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development_only';

// --- Auth Routes ---

router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(username) as any;
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    if (!bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    if (user.is_active === 0) {
      return res.status(403).json({ error: 'Account is pending admin approval' });
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/register', (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const checkStmt = db.prepare('SELECT id FROM users WHERE username = ?');
    if (checkStmt.get(username)) {
      return res.status(409).json({ error: 'Username already taken' });
    }
    
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const id = crypto.randomUUID();
    
    const insertStmt = db.prepare(`
      INSERT INTO users (id, username, password_hash, email, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    insertStmt.run(id, username, hash, email || null, 'user', 0); // Active = 0 (needs approval)
    
    res.status(201).json({ message: 'Registration successful. Pending admin approval.' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const stmt = db.prepare('SELECT id, username, email, role, is_active FROM users WHERE id = ?');
    const user = stmt.get(decoded.id) as any;
    
    if (!user || user.is_active === 0) {
      return res.status(401).json({ error: 'Unauthorized or account inactive' });
    }
    
    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Middleware for admin routes
const requireAdmin = (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admins only' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// --- Admin Routes ---

router.get('/users', requireAdmin, (req, res) => {
  try {
    const stmt = db.prepare('SELECT id, username, email, role, is_active, created_at FROM users ORDER BY created_at DESC');
    const users = stmt.all();
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/users', requireAdmin, (req, res) => {
  try {
    const { username, password, email, role, is_active } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const checkStmt = db.prepare('SELECT id FROM users WHERE username = ?');
    if (checkStmt.get(username)) {
      return res.status(409).json({ error: 'Username already taken' });
    }
    
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const id = crypto.randomUUID();
    
    const insertStmt = db.prepare(`
      INSERT INTO users (id, username, password_hash, email, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    insertStmt.run(id, username, hash, email || null, role || 'user', is_active !== undefined ? is_active : 1);
    
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/users/:id/status', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { is_active, send_email } = req.body;
    
    if (typeof is_active !== 'number') {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const userStmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const user = userStmt.get(id) as any;
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Cannot deactivate the default admin jatelo
    if (user.username === 'jatelo' && is_active === 0) {
      return res.status(400).json({ error: 'Cannot deactivate the default admin account' });
    }
    
    const updateStmt = db.prepare('UPDATE users SET is_active = ? WHERE id = ?');
    updateStmt.run(is_active, id);
    
    // Simulate email sending if requested and activating
    if (is_active === 1 && send_email && user.email) {
      console.log(`[EMAIL MOCK] Sending activation email to ${user.email} (User: ${user.username})`);
      // In a real app, use nodemailer or similar here
    }
    
    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as authRoutes };
