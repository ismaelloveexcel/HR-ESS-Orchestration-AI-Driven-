import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = Router();

// Mock user database (replace with actual database)
const users = new Map();

// Register endpoint
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password, email, role = 'employee' } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (users.has(username)) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.set(username, { username, password: hashedPassword, email, role });

    res.status(201).json({ message: 'User registered successfully', username });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    const user = users.get(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { username: user.username, role: user.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({ token, username: user.username, role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
