import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'ADMIN' | 'STUDENT';
    name: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Token de autenticación no proporcionado.' });
  }

  const jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_key_java_course_2026';

  jwt.verify(token, jwtSecret, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido o expirado.' });
    }
    req.user = user;
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
