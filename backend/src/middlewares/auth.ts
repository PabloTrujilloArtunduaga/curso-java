import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getEnv } from '../config/env.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'STUDENT';
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Token de autenticación no proporcionado.' });
  }

  const { JWT_SECRET } = getEnv();

  jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }, (err: any, decoded: any) => {
    if (err || !decoded || typeof decoded !== 'object') {
      return res.status(403).json({ message: 'Token inválido o expirado.' });
    }

    const user = decoded as Partial<AuthenticatedUser>;
    if (!user.id || !user.role || !['ADMIN', 'STUDENT'].includes(user.role)) {
      return res.status(403).json({ message: 'Token con estructura o rol no válido.' });
    }

    req.user = {
      id: user.id,
      email: user.email || '',
      role: user.role as 'ADMIN' | 'STUDENT',
      name: user.name || ''
    };
    next();
  });
};

export const requireRole = (role: 'ADMIN' | 'STUDENT') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado.' });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ message: `Acceso denegado. Se requiere rol ${role}.` });
    }
    next();
  };
};
