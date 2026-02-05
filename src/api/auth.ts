/**
 * Authentication API Routes
 * 
 * Handles user registration, login, and token management.
 * UAE multi-entity aware.
 */

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../database';
import { generateToken, authenticate, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { 
      username, 
      password, 
      email, 
      role = 'employee',
      entityCode = 'BAYNUNAH',
      employeeId 
    } = req.body;

    // Validation
    if (!username || !password || !email) {
      return res.status(400).json({ 
        error: 'Validation Error',
        message: 'Username, password, and email are required' 
      });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Validation Error',
        message: 'Password must be at least 8 characters long' 
      });
    }

    // Check if user exists
    if (db.getUserByUsername(username)) {
      return res.status(409).json({ 
        error: 'Conflict',
        message: 'Username already exists' 
      });
    }

    if (db.getUserByEmail(email)) {
      return res.status(409).json({ 
        error: 'Conflict',
        message: 'Email already registered' 
      });
    }

    // Validate entity
    const entity = db.getEntityByCode(entityCode);
    if (!entity) {
      return res.status(400).json({ 
        error: 'Validation Error',
        message: 'Invalid entity code' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = db.createUser({
      username,
      password: hashedPassword,
      email,
      role,
      entityCode,
      employeeId,
      isActive: true
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      entityCode: user.entityCode,
      employeeId: user.employeeId
    });

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        entityCode: user.entityCode
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Registration failed' 
    });
  }
});

/**
 * @route POST /api/auth/login
 * @desc Authenticate user and get token
 * @access Public
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password, email } = req.body;

    // Allow login with username or email
    if ((!username && !email) || !password) {
      return res.status(400).json({ 
        error: 'Validation Error',
        message: 'Username/email and password are required' 
      });
    }

    // Find user
    const user = username 
      ? db.getUserByUsername(username) 
      : db.getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid credentials' 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Account is deactivated' 
      });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid credentials' 
      });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      entityCode: user.entityCode,
      employeeId: user.employeeId
    });

    // Get entity info
    const entity = db.getEntityByCode(user.entityCode);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        entityCode: user.entityCode,
        entityName: entity?.name
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Login failed' 
    });
  }
});

/**
 * @route GET /api/auth/me
 * @desc Get current user info
 * @access Private
 */
router.get('/me', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = db.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const entity = db.getEntityByCode(user.entityCode);
    let employee = null;

    if (user.employeeId) {
      employee = db.getEmployeeById(user.employeeId);
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        entityCode: user.entityCode,
        entityName: entity?.name,
        createdAt: user.createdAt
      },
      employee: employee ? {
        id: employee.id,
        employeeNumber: employee.employeeNumber,
        firstName: employee.firstName,
        lastName: employee.lastName,
        position: employee.position,
        department: employee.department
      } : null
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

/**
 * @route POST /api/auth/change-password
 * @desc Change user password
 * @access Private
 */
router.post('/change-password', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Validation Error',
        message: 'Current and new password are required' 
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ 
        error: 'Validation Error',
        message: 'New password must be at least 8 characters long' 
      });
    }

    const user = db.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Current password is incorrect' 
      });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    db.updateUser(user.id, { password: hashedPassword });

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

/**
 * @route GET /api/auth/entities
 * @desc Get available entities for registration
 * @access Public
 */
router.get('/entities', (req: Request, res: Response) => {
  try {
    const entities = db.getEntities()
      .filter(e => e.isActive)
      .map(e => ({
        code: e.code,
        name: e.name,
        country: e.country
      }));

    res.json({ entities });

  } catch (error) {
    console.error('Get entities error:', error);
    res.status(500).json({ error: 'Failed to get entities' });
  }
});

export default router;
