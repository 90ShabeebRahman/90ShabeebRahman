import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database/db';
import { AuthRequest } from '../middleware/auth';
import { cryptoRandomString } from '../utils/id';

const JWT_SECRET = process.env.JWT_SECRET || 'musiq-secret-key-fallback';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existingUser) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const id = cryptoRandomString(16);
    const avatarUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`;

    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, avatar_url)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, name.trim(), email.toLowerCase().trim(), passwordHash, avatarUrl);

    const token = jwt.sign({ id, email: email.toLowerCase().trim(), name: name.trim() }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as any,
    });

    res.status(201).json({
      user: { id, name: name.trim(), email: email.toLowerCase().trim(), avatar_url: avatarUrl },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim()) as any;
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as any,
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
}

export async function me(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = db.prepare('SELECT id, name, email, avatar_url, created_at FROM users WHERE id = ?').get(req.user.id) as any;
    if (!user) {
      res.status(444).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve user profile' });
  }
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { name, avatar_url } = req.body;
    if (!name && !avatar_url) {
      res.status(400).json({ error: 'Name or avatar URL required for update' });
      return;
    }

    const current = db.prepare('SELECT name, avatar_url FROM users WHERE id = ?').get(req.user.id) as any;
    const newName = name ? name.trim() : current.name;
    const newAvatar = avatar_url !== undefined ? avatar_url : current.avatar_url;

    db.prepare(`
      UPDATE users SET name = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(newName, newAvatar, req.user.id);

    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        name: newName,
        avatar_url: newAvatar,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
}
