/**
 * Authentication Middleware
 * 
 * JWT-based authentication for protected routes.
 * Supports role-based access control (RBAC).
 */

import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';

// Extended Request type with user info
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
    email: string;
    role: 'admin' | 'hr_manager' | 'manager' | 'employee';
    employeeId?: string;
    entityCode: string;
  };
}

// JWT payload type
interface JWTPayload {
  userId: string;
  username: string;
  email: string;
  role: 'admin' | 'hr_manager' | 'manager' | 'employee';
  employeeId?: string;
  entityCode: string;
  iat?: number;
  exp?: number;
}

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'No authorization header provided' 
      });
      return;
    }

    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid authorization format. Use: Bearer <token>' 
      });
      return;
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET || 'default_secret_change_in_production';

    const decoded = jwt.verify(token, secret) as JWTPayload;
    
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
      employeeId: decoded.employeeId,
      entityCode: decoded.entityCode
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Token has expired' 
      });
      return;
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid token' 
      });
      return;
    }

    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Authentication failed' 
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  try {
    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET || 'default_secret_change_in_production';
    const decoded = jwt.verify(token, secret) as JWTPayload;
    
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
      employeeId: decoded.employeeId,
      entityCode: decoded.entityCode
    };
  } catch {
    // Ignore errors for optional auth
  }

  next();
};

/**
 * Role-based authorization middleware factory
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Authentication required' 
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        error: 'Forbidden', 
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
      });
      return;
    }

    next();
  };
};

/**
 * Entity-based authorization - ensures user can only access their entity's data
 */
export const authorizeEntity = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Authentication required' 
    });
    return;
  }

  // Admins can access all entities
  if (req.user.role === 'admin') {
    next();
    return;
  }

  // Check if entityCode in request matches user's entity
  const requestEntityCode = req.params.entityCode || req.body.entityCode || req.query.entityCode;
  
  if (requestEntityCode && requestEntityCode !== req.user.entityCode) {
    res.status(403).json({ 
      error: 'Forbidden', 
      message: 'Access denied to this entity' 
    });
    return;
  }

  next();
};

/**
 * Self-access authorization - user can only access their own data
 */
export const authorizeSelf = (paramName: string = 'employeeId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Authentication required' 
      });
      return;
    }

    // Admins and HR managers can access any employee
    if (['admin', 'hr_manager'].includes(req.user.role)) {
      next();
      return;
    }

    // Managers can access their direct reports (would need additional logic)
    // For now, just check if accessing own data
    const requestedId = req.params[paramName] || req.body[paramName];
    
    if (requestedId && requestedId !== req.user.employeeId) {
      res.status(403).json({ 
        error: 'Forbidden', 
        message: 'You can only access your own data' 
      });
      return;
    }

    next();
  };
};

/**
 * Generate JWT token
 */
export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  const secret = process.env.JWT_SECRET || 'default_secret_change_in_production';
  const options: SignOptions = { 
    expiresIn: '24h'
  };
  
  return jwt.sign(payload as object, secret, options);
};

/**
 * Verify and decode token (utility function)
 */
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'default_secret_change_in_production';
    return jwt.verify(token, secret) as JWTPayload;
  } catch {
    return null;
  }
};

export default {
  authenticate,
  optionalAuth,
  authorize,
  authorizeEntity,
  authorizeSelf,
  generateToken,
  verifyToken
};
