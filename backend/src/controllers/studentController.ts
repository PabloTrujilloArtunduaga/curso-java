import { Response } from 'express';
import { query } from '../db/index.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';

export const getStudents = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const studentsRes = await query(
      `SELECT id, email, name, last_name as "lastName", phone, role, created_at as "createdAt"
       FROM users 
       WHERE role = 'STUDENT' AND email != 'u20232218369@usco.edu.co'
       ORDER BY name ASC`
    );
    return res.json(studentsRes.rows);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener estudiantes.' });
  }
};

export const getStudentsCount = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const countRes = await query(
      `SELECT COUNT(*) FROM users WHERE role = 'STUDENT' AND email != 'u20232218369@usco.edu.co'`
    );
    return res.json({ count: parseInt(countRes.rows[0].count, 10) });
  } catch (error) {
    return res.status(500).json({ message: 'Error al contar estudiantes.' });
  }
};
